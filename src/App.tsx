import React from 'react';
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from 'primereact/inputtextarea';
import Cookies, { Cookie } from "universal-cookie"

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
  relayAddress: string;
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

interface ICatanSettings {
  relayAddress: string;
  user: string;
}

class MainPage extends React.Component<{}, IMainPageState> {
  _socket: SocketData = new SocketData(this);
  private cookie: Cookie = new Cookies();
  private mySettings: ICatanSettings = {
    relayAddress: "ws://10.0.75.1:8080/ws",
    user: "Joe"
  };
  constructor(props: {}) {
    super(props);
    try {
      const cookieSettings = this.cookie.get("settings")
      console.log("found cookie: %o", cookieSettings)
      this.mySettings.relayAddress = cookieSettings["relayAddress"];
      this.mySettings.user = cookieSettings["user"];
    }
    catch (er) { // if there is an error, delete the cookie
      console.log(`error loading cookie: ${er}`);
      // this.cookie.delete("settings");
    }
    this.state = {
      cardsLostToMonopoly: "0",
      cardsLostToSeven: "0",
      relayAddress: this.mySettings.relayAddress,
      serverResponse: "server response goes here",
      user: this.mySettings.user
    }


  }

  public componentWillMount = async () => {
    console.log("connecting to server")
    await this._socket.Connect(this.state.relayAddress).then();
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

  private saveSettings = (): void => {
    console.log("saving settings %o", this.mySettings)
    this.cookie.set("settings", JSON.stringify(this.mySettings));
  }

  public render = () => {
    return (
      <div>


        <label className="relayLabel">Relay</label>
        <InputText id="relayAddress" style={{ width: "14em" }} spellCheck={false} className="param-input txtRelay"
          value={this.state.relayAddress}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => event.currentTarget!.select()}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            this.setState({ relayAddress: event.currentTarget!.value })
          }}

          onBlur={(event: React.FormEvent<HTMLInputElement>) => {
            this.mySettings.relayAddress = this.state.relayAddress;
            this.saveSettings();
          }}

        />
        <div>
          <label className="userLabel">User</label>
          <Dropdown className="userDropdown" value={this.state.user} options={Users}
            placeholder="User:"
            onChange={(e: { originalEvent: Event; value: any; }) => {
              this.setState({ user: e.value })
              this.mySettings.user = e.value;
              this.saveSettings();
            }}
          />
        </div>
        <div style={{ height: "1em" }} />
        <div className="p-grid">
          <Button className="p-col param-column p-button numberButton" label="2" onClick={() => { this.sendMessage(MessageType.Roll, "2") }} />
          <Button className="p-col param-column p-button numberButton" label="3" onClick={() => { this.sendMessage(MessageType.Roll, "3") }} />
          <Button className="p-col param-column p-button numberButton" label="4" onClick={() => { this.sendMessage(MessageType.Roll, "4") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column p-button numberButton" label="5" onClick={() => { this.sendMessage(MessageType.Roll, "5") }} />
          <Button className="p-col param-column p-button-danger numberButton" label="6" onClick={() => { this.sendMessage(MessageType.Roll, "6") }} />
          <Button className="p-col param-column p-button p-button-rounded numberSeven numberButton" label="7" onClick={() => { this.sendMessage(MessageType.Roll, "7") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column p-button-danger  numberButton" label="8" onClick={() => { this.sendMessage(MessageType.Roll, "8") }} />
          <Button className="p-col param-column  numberButton" label="9" onClick={() => { this.sendMessage(MessageType.Roll, "9") }} />
          <Button className="p-col param-column numberButton" label="10" onClick={() => { this.sendMessage(MessageType.Roll, "10") }} />
        </div>
        <div className="p-grid">
          <Button className="p-col param-column numberButton" label="11" onClick={() => { this.sendMessage(MessageType.Roll, "11") }} />
          <Button className="p-col param-column numberButton" label="12" onClick={() => { this.sendMessage(MessageType.Roll, "12") }} />
          <Button className="p-col param-column numberButton baronButton" label="Play Baron" onClick={() => { this.sendMessage(MessageType.AllowMoveBaron, "True") }} />
        </div>
        <div style={{ height: "1em" }} />
        <div className="p-col param-column">
          <span className="p-float-label">
            <InputText id="cardsLostToSeven" spellCheck={false} style={{ width: "14em" }} value={this.state.cardsLostToSeven} className="param-input lostCardInput"
              onFocus={(event: React.FocusEvent<HTMLInputElement>) => event.currentTarget!.select()}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                const val: string = event.currentTarget!.value;
                console.log(`[val=${val}]`)
                this.setState({ cardsLostToSeven: val })
              }} />
            <label htmlFor="cardsLostToSeven" className="param-label labelForLostCards">Cards Lost to 7</label>
            <Button label="Update" onClick={() => { this.sendMessage(MessageType.CardsLostToSeven, this.state.cardsLostToSeven) }} />
          </span>
        </div>
        <div className="p-col param-column">
          <span className="p-float-label" >
            <InputText id="cardsLostToMonopoly" spellCheck={false} className="param-input lostCardInput"
              value={this.state.cardsLostToMonopoly}
              onFocus={(event: React.FocusEvent<HTMLInputElement>) => event.currentTarget!.select()}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                this.setState({ cardsLostToMonopoly: event.currentTarget!.value })
              }} />
            <label htmlFor="cardsLostToMonopoly" className="param-label labelForLostCards" >Cards Lost to Monopoly</label>
            <Button label="Update" onClick={() => { this.sendMessage(MessageType.CardsLostToMonopoly, this.state.cardsLostToMonopoly) }} />
          </span>
        </div>
        <div className="p-grid">
          <Button className="p-col param-column actionButton" label="Undo" onClick={() => { this.sendMessage(MessageType.Undo, "true") }} />
          <Button className="p-col param-column actionButton" label="Next" onClick={() => { this.sendMessage(MessageType.Next, "true") }} />
        </div>

        <label className="param-label" >Server Message</label>
        <div className="messageDiv">
          <InputTextarea id="serverMessage" value={this.state.serverResponse} cols={48} />
        </div>

      </div>
    )
  }
}

export default MainPage;
