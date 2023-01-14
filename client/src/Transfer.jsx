import { useState } from "react";
import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from 'ethereum-cryptography/utils'

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recoveryBit, setRecoveryBit] = useState();
  const [signature, setSignature] = useState();
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault(); 

    const message = '{from: ${address}, to: ${recipient}, amount: ${sendAmount}}';
    const hashmsg = keccak256(utf8ToBytes(message));

    console.log("message Hash:", hashmsg);
    const[sig, recoverBit] = await secp.sign(hashmsg, privateKey, {recovered: true,});

    setSignature(sig);
    setRecoveryBit(recoverBit);
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient, 
        hashmsg: toHex(hashmsg),
        sig: toHex(sig),
        recoverBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key:{privateKey.slice(-5)}...
        <input
          placeholder="Type in your private key ( Make sure it is correct ) !"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
          type="password"
        ></input>
      </label>

      <div> recoveryBit: {recoveryBit} </div>
      <div>Signature: {signature} </div>
      
      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
