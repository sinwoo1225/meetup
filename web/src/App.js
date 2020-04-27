import React,{Component} from 'react';
import { initSocket } from "./socketControllers/socket";
import Confference from './components/Conferrece';

class App extends Component {

  constructor(props){
    super(props);
    this.state= {socket:null};
  }
  
  componentDidMount(){
    this.setState({socket:initSocket(this)});
  }

  render(){
    return (
      <div className="App">
        <h1>Video Conferrencing</h1>
        <Confference/>
      </div>
    );
  }
}

export default App;
