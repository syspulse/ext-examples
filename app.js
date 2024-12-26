const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8300;
const serviceUrl = process.env.SERVICE_URL || "http://localhost:8300/test";
const jwt = process.env.AUTH_JWT || '';

app.use(express.json());

app.post('/test', async (req, res) => {
    console.info('[test] req:', req.body);
    res.status(200).json({ status: 'OK' });
});

app.post('/webhook', async (req, res) => {
  console.info('[webhook] req:', req.body);  
  ext_contract_add(
    req.body.projectId, 
    req.body.data.action.params.to, 
    req.body.data.contract.network, 
    `Contract-${req.body.data.action.params.to.substring(0, 10)}`
  );

  res.status(200).json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Listen: 0.0.0.0:${port}`);
}); 

// ----------------------------------------------------------------------------------
async function ext_contract_add(pid, address, chain, name) {
  console.info(`[ext_contract_add] pid:${pid}, address:${address}, chain:${chain}, name:${name}`);
  const rsp = await axios.post(serviceUrl, {
    projectId: pid,
    address: address,
    chainUid: chain,
    name: name,
    abi: null,
    addressType: 'CONTRACT'
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,        
    }
  });
  
  console.info(`[ext_contract_add] rsp:${rsp.status}, ${rsp.data}`);  
}