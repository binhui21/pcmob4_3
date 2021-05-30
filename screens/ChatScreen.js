import React, {useState, useCallback, useEffect} from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import firebase from "../database/firebaseDB";
import {MaterialCommunityIcons } from "@expo/vector-icons";

const db = firebase.firestore().collection("messages");
const auth=firebase.auth();
const anonymousUser = { name: "Anonymous", id: "1A" };

export default function ChatScreen({navigation}) {

    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(anonymousUser);

    useEffect(() => {
        const unsubscribe = db
            .orderBy("createAt", "desc")
            .onSnapshot((collectionSnapshot) => {
                const serverMessages = collectionSnapshot.docs.map((doc) => {
                    const data = doc.data();
                    console.log(data);
                    
                    const jsDate = new Date(data.createAt.seconds = 1000);
                    
                    const newDoc = {
                        ...data,
                        createAt: jsDate,
                    };
                    return newDoc;
                });
                setMessages(serverMessages);
            });

            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                  navigation.navigate("Chat");
                  setCurrentUser({ id: user.uid, name: user.email });
                } else {
                  navigation.navigate("Login");
                  setCurrentUser(anonymousUser);
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
          //renderUsernameOnMessage={true}
         // listViewProps={{ style: { backgroundColor: "#777" }}}
          user={currentUser}
          //{{
            //_id: firebase.auth().currentUser.uid,
            //name: firebase.auth().currentUser.email,
          //}}
        />
      );
}