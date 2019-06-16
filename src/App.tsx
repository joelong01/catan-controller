import React from 'react';
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from 'primereact/inputtextarea';

import { Dropdown } from 'primereact/dropdown';
//
//  the different kinds of messages we can send
enum MessageType {
  Roll = 0,
  Next,
  Undo,
  AllowMoveBaron,
  CardsLostToMonopoly,
  CardsLostToSeven
}

type UserOptions = { label: string, value: string }

const Users: UserOptions[] = [
  { label: "Joe", value: "Joe" },
  { label: "Doug", value: "Doug" },
  { label: "Dodgy", value: "Dodgy" },
  { label: "Robert", value: "Robert" },
  { label: "Chris", value: "Chris" }
]


interface IMainPageState {
  cardsLostToMonopoly: string;
  cardsLostToSeven: string;
  serverIp: string;
  serverResponse: string;
  user: string;
}



class SocketData {
  _page: MainPage;
  _socket: WebSocket | undefined;
  constructor(cb: MainPage) {
    this._page = cb;
  }

  public Connect = (addr: string): Promise<WebSocket | Event> => {
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(addr);
      this._socket.onmessage = this.onMessage;
      this._socket.onopen = () => {
        resolve(this._socket);
      };
      this._socket.onerror = (ev: Event) => {
        reject(ev);
      };
    });
  }

  private onMessage = (ev: MessageEvent) => {
    this._page.onMessage(ev);
  }

  public send = (msg: string) => {
    if (this._socket !== undefined) {
      this._socket.send(msg);
    }
  }

}



class MainPage extends React.Component<{}, IMainPageState> {
  _socket: SocketData = new SocketData(this);
  constructor(props: {}) {
    super(props);
    this.state = {
      cardsLostToMonopoly: "0",
      cardsLostToSeven: "0",
      serverIp: "ws://localhost:8080/ws",
      serverResponse: "server response goes here",
      user: Users[0].value
    }
  }

  public componentWillMount = async () => {
    console.log("connecting to server")
    await this._socket.Connect(this.state.serverIp).then();
  }

  public onMessage = (msg: MessageEvent) => {
    this.setState({ serverResponse: msg.data });
  }


  public sendMessage = (type: MessageType, value: string): void => {
    console.log(`sending message id=${type} value=${value}`)

    var msg: object = {
      ID: type,
      User: this.state.user,
      Value: value,
    }

    this._socket.send(JSON.stringify(msg));

  }

  public render = () => {
    return (
      <div>
        <div style={{ height: "50px" }} />
        <div className="p-grid">
          <Dropdown className="userDropdown" value={this.state.user} options={Users} onChange={(e)=>this.setState({user: e.value})} placeholder="User:"/>
          
        </div>
        <div className="p-grid">
          <Button className="p-col param-column p-button" label="2" onClick={() => { this.sendMessage(MessageType.Roll, "2") }} />
          <Button className="p-col param-column p-button" label="3" onClick={() => { this.sendMessage(MessageType.Roll, "3") }} />
          <Button className="p-col param-column p-button" label="4" onClick={() => { this.sendMessage(MessageType.Roll, "4") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column p-button" label="5" onClick={() => { this.sendMessage(MessageType.Roll, "5") }} />
          <Button className="p-col param-column p-button-danger" label="6" onClick={() => { this.sendMessage(MessageType.Roll, "6") }} />
          <Button className="p-col param-column p-button p-button-rounded numberSeven" label="7" onClick={() => { this.sendMessage(MessageType.Roll, "7") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column p-button-danger" label="8" onClick={() => { this.sendMessage(MessageType.Roll, "8") }} />
          <Button className="p-col param-column" label="9" onClick={() => { this.sendMessage(MessageType.Roll, "9") }} />
          <Button className="p-col param-column" label="10" onClick={() => { this.sendMessage(MessageType.Roll, "10") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column" label="11" onClick={() => { this.sendMessage(MessageType.Roll, "11") }} />
          <Button className="p-col param-column" label="12" onClick={() => { this.sendMessage(MessageType.Roll, "12") }} />
          <Button className="p-col param-column" label="Play Baron Before Rolling" onClick={() => { this.sendMessage(MessageType.AllowMoveBaron, "True") }} />
        </div>
        <div className="p-col param-column">
          <span className="p-float-label">
            <InputText id="cardsLostToSeven" spellCheck={false} style={{ width: "14em" }} value={this.state.cardsLostToSeven} className="param-input" onChange={(event: React.FormEvent<HTMLInputElement>) => {
              const val: string = event.currentTarget!.value;
              console.log(`[val=${val}]`)
              this.setState({ cardsLostToSeven: val })
            }} />
            <label htmlFor="cardsLostToSeven" className="param-label">Cards Lost to 7</label>
            <Button label="Update" onClick={() => { this.sendMessage(MessageType.CardsLostToSeven, this.state.cardsLostToSeven) }} />
          </span>
        </div>
        <div className="p-col ">
          <span className="p-float-label" >
            <InputText id="cardsLostToMonopoly" style={{ width: "14em" }} spellCheck={false} className="param-input"
              value={this.state.cardsLostToMonopoly}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                this.setState({ cardsLostToMonopoly: event.currentTarget!.value })
              }} />
            <label htmlFor="cardsLostToMonopoly" className="param-label" >Cards Lost to Monopoly</label>
            <Button label="Update" onClick={() => { this.sendMessage(MessageType.CardsLostToMonopoly, this.state.cardsLostToMonopoly) }} />
          </span>
        </div>
        <div className="p-grid">
          <Button className="p-col param-column" label="Undo" onClick={() => { this.sendMessage(MessageType.Undo, "true") }} />
          <Button className="p-col param-column" label="Next" onClick={() => { this.sendMessage(MessageType.Next, "true") }} />
        </div>
        <div className="p-grid">
          <span className="serverMessageSpan">
            <label htmlFor="serverMessage" className="param-label" >Server Message</label>
            <InputTextarea id="serverMessage" style={{ width: "100%" }} value={this.state.serverResponse} />
          </span>
        </div>
      </div>
    )
  }
}

export default MainPage;
