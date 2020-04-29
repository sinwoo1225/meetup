import React,{Component} from 'react';
import Confference from './components/Conferrece';

class App extends Component {

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
