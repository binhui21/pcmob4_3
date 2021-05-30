import React, {useState, useCallback, useEffect} from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import firebase from "../database/firebaseDB";
import {MaterialCommunityIcons } from "@expo/vector-icons";

const db = firebase.firestore().collection("messages");

export default function ChatScreen({navigation}) {

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const unsubscribe = db
            .orderBy("createAt", "desc")
            .onSnapshot((collectionSnapshot) => {
                const serverMessages = collectionSnapshot.docs.map((doc) => doc.data());
                setMessages(serverMessages);
            });
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                navigation.navigate("Chat", { id: user.id, email: user.email });
            } else {
                navigation.navigate("Login");
            }
        });

        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={logout}>
                    <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color="grey"
                        style={{ marginRight: 20 }}
                    />
                </TouchableOpacity>
            ),
        });
        return unsubscribe;
    },[]);

    function logout() {
        firebase.auth().signOut();
    }

    function sendMessages(newMessages) {
        console.log(newMessages);
        db.add(newMessages[0]);
    }

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
      }, [])

    return (
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
        />
      );
}