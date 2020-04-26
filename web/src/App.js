import React,{Component} from 'react';
import socketIo from 'socket.io-client';



class App extends Component {
  state = {
    socket:null
  }
  
  
  componentDidMount(){ 
    // 소켓 초기화
    const socket = socketIo('http://localhost:4000');
    socket.on("receive",({message})=>{
      console.log(`server : ${message}`);
    });
    this.setState({socket});
  }

  handler(event){
    const echoInput = document.getElementById("echoInput");
    const { socket } = this.state; 
    
    if(!socket){
      alert("you don't have socket connection");
      return;
    }
    socket.emit("echo",{message:echoInput.value});
  }

  render(){
    return (
      <div className="App">
        <h1>Hello React</h1>
        <input id="echoInput" placeholder="입력"/>
        <button onClick={this.handler.bind(this)}>echo</button>
      </div>
    );
  }
}

export default App;
