const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8300;
const serviceUrl = process.env.SERVICE_URL || "http://localhost:8300/test";
const jwt = process.env.AUTH_JWT || '';

app.use(express.json());

// ----------------------------------------------------------------------------------
async function ext_contract_add(pid, address, chain, name) {
  console.info(`[ext_contract_add] pid:${pid}, address:${address}, chain:${chain}, name:${name}`);
  const rsp = await axios.post(`${serviceUrl}/contract`, {
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

async function ext_contract_get(cid) {
  console.info(`[ext_contract_get] cid:${cid}`);
  const rsp = await axios.get(`${serviceUrl}/contract/${cid}`,
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,        
    }
  });
  
  console.info(`[ext_contract_get] rsp:${rsp.status}, ${rsp.data}`);
  return rsp.data;
}

async function ext_detector_add(cid, sid, name, config) {
  console.info(`[ext_detector_add] cid:${cid}, sid=${sid}, name:${name}, config=${config}`);
  const rsp = await axios.post(`${serviceUrl}/detector`, {
    contractId: cid,
    schemaId: sid,
    source: 'ATTACK_DETECTOR',
    destinations: [],
    status: "ACTIVE",
    tags:["SECURITY"],
    name: name,
    
    config: {
      severity: -1,
      ...config
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,        
    }
  });
  
  console.info(`[ext_detector_add] rsp:${rsp.status}, ${rsp.data}`);  
}

// ---------------------------------------------------------------------------------------------------

app.post('/test', async (req, res) => {
  console.info('[test] req:', req.body);
  res.status(200).json({ status: 'OK' });
});

app.post('/webhook', async (req, res) => {
  console.info('[webhook] req:', req.body);
  const contract = await ext_contract_get(req.body.data.contract.id)
  const pid = contract.projectId;
  
  ext_contract_add(
    pid, 
    req.body.data.action.params.to, 
    req.body.data.contract.network, 
    `Contract-${req.body.data.action.params.to.substring(0, 10)}`
  );

  // const sid = 234; // AML
  const sid = 186; // TVL
  const tvl_token = req.body.data.contract.address

  ext_detector_add(
      req.body.data.contract.id,
      sid, 
      "TVL Monitor",
      {
        tokens: [
            {
                "threshold": "25%",
                "token": tvl_token
            }
        ]
      }
  );

  res.status(200).json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Listen: 0.0.0.0:${port}`);
}); 
