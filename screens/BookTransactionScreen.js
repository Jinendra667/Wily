import React from 'react';
import {Text, View , TouchableOpacity , StyleSheet , Image , TextInput, TextInputComponent, Alert} from 'react-native';
import Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
            transactionMessage:""
        }
    }
    getPermissionsAsync = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermissions : status === 'granted' , buttonState:'id' , scanned:false  });
      };
      handleBarcodeScanned = async({type,data})=>{
          const {buttonState}=this.state
          if(buttonState==="bookId"){
              this.setState({scanned:true , scannedBookId:data , buttonState:"normal"})
          }
          else if(buttonState==="studentId"){
            this.setState({scanned:true , scannedStudentId:data , buttonState:"normal"})
        }
      }
      handleTransaction = async()=>{
          var transactionMessage = null;
          db.collection('books').doc(this.state.scannedBookId).get()
          .then((doc)=>{
var book = doc.data()
if(book.bookAvailability){
    this.initiateBookIssue();
    transactionMessage = "bookIssued"
    Alert.alert(transactionMessage)
}
else{this.initiateBookReturn()
transactionMessage = "bookReturned"}
Alert.alert(transactionMessage)
          })
          this.setState({transactionMessage:transactionMessage})
      }
      initiateBookIssue = async()=>{
          db.collection("transactions").add({
              studentId:this.state.scannedStudentId,
              bookId:this.state.scannedBookId,
              date:firebase.firestore.Timestamp.now().toDate(),
              transactionType:'issue'

          })
          db.collection("books").doc(this.state.scannedBookId).update({
              'bookAvailability':false
          })
          db.collection("students").doc(this.state.scannedStudentId).update({
              'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
          })
          this.setState({
              scannedStudentId:'',
              scannedBookId:''
          })
      }
      initiateBookReturn = async()=>{
        db.collection("transactions").add({
            studentId:this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'return'

        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }
      render(){
          const hasCameraPermissions = this.state.hasCameraPermissions
          const scanned = this.state.scanned
          const buttonState = this.state.buttonState
          if(buttonState !== "normal" && hasCameraPermissions){
              return(
                  <BarCodeScanner onBarCodeScanned = {scanned ? undefined:this.handleBarcodeScanned } style={StyleSheet.absoluteFillObject}></BarCodeScanner>

              )
          }
          else if (buttonState === "normal"){
              return(
                  <View style={styles.container}>
                      <View>
<Image source = {require("../assets/booklogo.jpg")} style={{width:200 , height:200}}></Image>
<Text style={{textAlign:"center" , fontSize:30}}>
    Wily
</Text>
                      </View>
                      <View style={styles.inputView}>
<TextInput style={styles.inputBox} placeholder="bookId" value={this.state.scannedBookId} onChangeText={(text)=>{this.setState({
    scannedBookId:text
})}}></TextInput>
<TouchableOpacity style={styles.scanButton} onPress={()=>{
    this.getPermissionsAsync("bookId")
}}>
<Text style={styles.buttonText}>
    Scan
</Text>
</TouchableOpacity>
                      </View>
                      <View style={styles.inputView}>
<TextInput style={styles.inputBox} placeholder="studentId" value={this.state.scannedStudentId} onChangeText={(text)=>{this.setState({
    scannedStudentId:text
})}}></TextInput>
<TouchableOpacity style={styles.scanButton} onPress={()=>{
    this.getPermissionsAsync("studentId")
}}>
<Text style={styles.buttonText}>
    Scan
</Text>
</TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.submitButton} onPress={async ()=>{
                          var transactionMessage = await this.handleTransaction();
                      }}>
                          <Text style={styles.submitButtonText}>
                              Submit
                          </Text>

                      </TouchableOpacity>
                  </View>
              )
          }
      }
      
    
}
const styles = StyleSheet.create({
    container:{
        flex:1, justifyContent:"center" , alignItems:"center"
    },
    inputView:{
        flexDirection:"row" , fontSize:20
    },
    inputBox:{width:200 , height:40 , borderWidth:1.5 , borderRightWidth:0 , fontSize:20},
    scanButton:{
        backgroundColor:"#66bb6a" , width:50  , borderWidth:1.5 , borderLeftWidth:0
    },
    submitButton:{
        backgroundColor:"#fbc02d"  , width:100 , height:50
    },
    submitButtonText:{
        padding:10 , textAlign:"center" , fontSize:20 , fontWeight:"bold" , color:"white"
    },
    buttonText:{
        fontSize:15 , textAlign:"center" , marginTop:10
    },
    displayText:{
        fontSize:15
    }
})

