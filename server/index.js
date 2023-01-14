const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const keccak = require("ethereum-cryptography/keccak");
const utils = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "04fd1361e5cbb28c445d67dd119010a28d7f20fc9b618b34bf916e6568a6246a40cc3061f5ea167d0e095a4140f276af5f07c91fe8c108b89913df0103bb4d5e41": 100,
//private key 457fd54df1be6ddd1d424c5c7dc79749b4694825de79d618cacdc0a11d57fe3b
  "04d9011599391fc0403640f2233d02e4a11ef7129aba9f253a1c8ebd8b3e28ac55544a0b55d3055bb22de252e08e85851d1abba8903aa5c9cca25d0665b901097c": 50,
//private key 7792ab9272ac8c0f46ecb48019c2b9ffd9131284b092368cde05b27d311163ee
  "04f9ba33ecafbf96359b89b3f59e9fa674a3aa54a684a8d382192a4ac717b10d184fe92b6b7d5191851e9bf5a5f20fa7de07bb4b13e9e5048bebb9122425b89a25": 75,
//private key a9ea654656818d405367fad3c805f6b440e705d400ea0c4d546c7d2dcf27861b
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: get a signature from the client-side application
  //recover the public address from the signature
  const { sender, recipient, amount, hashmsg, sig, recoverBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const recoveredKey = secp.recoverPublicKey(hashmsg, sig, Number(recoverBit));
  console.log(utils.toHex(recoveredKey));

  if (utils.toHex(recoveredKey) !== sender) {
    res
      .status(400)
      .send({ message: "Incorrect, Private key incorrect" });
  } else {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
