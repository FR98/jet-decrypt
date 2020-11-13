const pbkdf2 = require('pbkdf2');
const atob = require('atob')
const btoa = require('btoa')
const crypto = require('crypto');
const cryptoJs = require('crypto-js')
const NodeRSA = require('node-rsa');


function hmac_sha256(msg, key){
  return crypto.createHmac('sha256', key)
    .update(msg)
    .digest('hex');
  }
  
  function isValidToken(token, userSecret, encoding='ascii'){
    const [
      encoded_meta, 
      encrypted_encoded_payload, 
      encrypted_private_key, 
    encoded_salt, 
    sign
  ] = token.split('.');
  const unsignedToken = `${encoded_meta}.${encrypted_encoded_payload}.${encrypted_private_key}.${encoded_salt}`;
  const calculatedSign = hmac_sha256(unsignedToken, 'my-secret-string' );
  return calculatedSign === sign ? true : false;
}

function decode_dict(encodedDict, encoding='ascii'){
  const dict_string = atob(encodedDict)
  return JSON.parse(dict_string)
}

function decrypt(userSecret, token){
  if (!isValidToken(token, userSecret)){
    console.log( 'error invalid token')
  }
  const [encoded_meta, encrypted_encoded_payload, private_key, encoded_salt, sign] = token.split('.');
  const salt = atob(encoded_salt)
  const meta = decode_dict(encoded_meta)
  // const derived_key = pbkdf2.pbkdf2Sync(
    //   userSecret,
    //   salt,
    //   meta.ite,
    //   meta.siz,
    //   meta.alg
    // )
  var pkstring = '-----BEGIN PRIVATE KEY-----'
  // for(let value = 0; value < private_key.length; value++) {
    // if ( value%64 === 0 ){
    //   pkstring = pkstring + '\n'  
    // }
  //   pkstring=pkstring+private_key[value]
  // }
  pkstring = pkstring + private_key + '-----END PRIVATE KEY-----'
  // const key = new NodeRSA({
  //   k: private_key,
  //   encryptionScheme: 'pkcs1'
  // });
  const key = new NodeRSA()
  key.importKey(private_key, 'pkcs8-private')
  console.log('\nencrypted_encoded_payload: ', encrypted_encoded_payload)
  console.log('\nencrypted_decoded_payload:atob ', atob(encrypted_encoded_payload))
  console.log('\nencrypted_decoded_payload (cryptoJs): ', cryptoJs.enc.Utf8.parse(encrypted_encoded_payload))
  console.log('\nencrypted_decoded_payload (cryptoJs AND atob): ', cryptoJs.enc.Utf8.stringify(atob(encrypted_encoded_payload)))

  console.log('\nencrypted_decoded_payload (cryptoJs) BASE64: ', cryptoJs.enc.Base64.parse(encrypted_encoded_payload).toString())
  // console.log('\nencrypted_decoded_payload (cryptoJs) BASE64 AND atob: ', cryptoJs.enc.Base64.stringify(atob(encrypted_encoded_payload)))
  
  const buff = Buffer.from(encrypted_encoded_payload, 'utf8')
  console.log('BUFF \n',buff.toString('hex'))
  // const decrypted = key.decrypt(buff, 'utf8');


  // const decoded_derypted = cryptoJs.enc.Base64.parse(decrypted);
  // var textString = cryptoJs.enc.Utf8.stringify(decoded_derypted);

  // console.log('DECRYPTED: ', textString)
  // const decrypted = atob(decrypted_encoded)

  // console.log('PAYLOAD: ',decrypted_encoded)

}

// const userSecret = crypto.createHmac('sha256', 'user-password').update('user-password').digest('hex')
const userSecret = hmac_sha256('user-password','user-password')
const token = 'eyJybmQiOiAiak82dTYrRFp5YTdhNkVZVCIsICJ0eXAiOiAiSkVULTEiLCAiYWxnIjogInNoYTI1NiIsICJpdGUiOiA1MDAwMCwgInNpeiI6IDY0LCAiZXhwIjogbnVsbH0=.KIFGKYVh01mGKeShb+JeQBf+IsABzt5WYH+0rh05Ns0yyLvoNSISvAS5IbA/cN8xSd/tN7dN6JR6r288gV0PyAWGjVoRLgSyxgzLWo11rFM9AO2F0adU6YPUfOHklLSxgSu6PAQmVkyoEZGwTYBkAMqPjBAwEHx6YpRZDichxNOzhV47XN0ODUW7gm318QWUraqnR9sgM/X9I/g0YiMkWaRd7K8/wpvqGXHb1v3JS8puI5bDRl3o4E8i+KtUqv6bNPu6z6xE0HWw87tkrj0oKuvPyPkNh3im1V7tXr7il7VY+PQQwA11gvZNfPcX5SUM4ToV5H1ug+7rXPn7GWlb9Q==.MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDQmQ793kDuNpe+tGs/T2W3rPhb4KFK4vs1HQxY4x6mC/uaoi5Ue+YOQPnC9fpo4z/pxPpkXCpcRSDiVGT1wMip5LCaAovagiVHUE8LvEmHDKBOog+xNZbHLG1NzWi15A1h7lM4336ZGxomwFDiFxjYsvE1wnpSp7WXme4IFTtZ25MH6ObIfALzZuGmNl21DdGmXMbQvfaOWrfYwlax/4S+kEyBEZFBkFsJU3OjtcXxlqc788AAbQmNsMQHZHhi0TGKunaH4stctTwPhD9XBVuC+ngCDTH81srIBTABU72fRzbYLOIeXz3+y3ykVi9kD3DWPc2PnGTgXUbwmQQoP+SFAgMBAAECggEAfi03LkS0DeOj4k0L2l3Sb0oHaLv1lHC79yK9Bz9KmLIC3URgteXEALc43L8hWzSqwmLN+srtLKb7/yuBbk3Qk0Ort1z275NtrTdcuQKJj1EJ3saUq2J4871h2H/5aJyro6MfX/WAhGgqZ2pJAplqBBopYZVjnH+pjiwkGWuOXQklgejIOpSRdOg/Ump0SJt4BE94aPtmjp8sFbVCrCWdXkF7ZiwLx9jkNBDxTtVSWZrtCzxlrV0QA3/rMMrvICZrahwqOUh2/WI+T4UKsGwX9wP/oGDlUxRZK77t+0XOXvDcVOYsS0wyWyOHLKXrxQpWwLaDwhKvU7IdJ6oNcAhDQQKBgQD+r8/FLhaBJ0VNIIXsoJp2byfTSK1aJidQe6wlER4jQXbyWVcupgUCBEtyMxUwV6aBRs+rRcB81wi7veaLnTPTlrjZn3+LI0DuGObQPszHAu3smlit4m8Sv8KROygLA1/0U3kXMAVfAZPNalIbTHsZ/G5UnBTiQBhts6EdhVoQWQKBgQDRrGjH5UAJ5HQBidl4VONbN5JgyBa1yTl4Myq6KbtwHCYqqrIemEJpvTngdHjZLsGYpaLaw/s8SNKVtU97HuCYccf0nwJ/lt1mlP18Y2J9GlbELftixKXQwIoO4VIVy8K2oZC+t2EN6nBhxUpmtPspYZIsCP4AddGpbRI3PfOQDQKBgDE/zBykEeP9tQ/6Bwu/7r6SNhBMUIFLOXT9xUcRrVNB+H9auVoi7nr6W6CEskc7283J5KSJA3TgnCa5zRgYWQpEbhBfIGnGcmrYU+HXEwA0189V9WoCjFoCzNwKpW6jw21aquLJ/W/mvS8OrTvsKS3YO3mPCRbLMC4eezxbKhRZAoGAeoFEez67qsv654c2M7NNX1dZxAhEFJRsaolitoB5jmgz+IvhJDUL4KH5teX3UdWasWhdfXoySSe3OldECAijaw5XqNpa6FcqJqx4anva6INCHL9M+Iky5IQKZeVKQ4fYzUIawwN7xliqrsVJ0jZ95NCoSeg7F+O+y0H5+aLNsuUCgYASoJVSDCuNVpYuZt5dF5ycQpfC4bc5pNrDkf93VAsXK8JK5lGh0oRsNJRUBTzc4L8m3cQG2tfOBd6E9GgiQ/LshbGH/QWa/TzBRTSbbocqVnUMW3tC54Gj2cp53MXiBGvWHhFmI/SdKxN3CUcfc7NYZKL5L/qXPmfee9ZJ7nUtNw==.sc2UpdDGD1S33A2MAh3WbYAz0JrantCpQFW5wzN+AvMXKZguwWME5OYMiid2bWik8IQl6EkTS1tpGy9yX9UK/Q==.d8cc267351ca31153093e21882f0e4d3f984bf4bf9638c686675b8c5d211f313'

decrypt(userSecret, token)

/*

encrypted_encoded_payload:
 KIFGKYVh01mGKeShb+JeQBf+IsABzt5WYH+0rh05Ns0yyLvoNSISvAS5IbA/cN8xSd/tN7dN6JR6r288gV0PyAWGjVoRLgSyxgzLWo11rFM9AO2F0adU6YPUfOHklLSxg
 Su6PAQmVkyoEZGwTYBkAMqPjBAwEHx6YpRZDichxNOzhV47XN0ODUW7gm318QWUraqnR9sgM/X9I/g0YiMkWaRd7K8/wpvqGXHb1v3JS8puI5bDRl3o4E8i+KtUqv6bNPu
 6z6xE0HWw87tkrj0oKuvPyPkNh3im1V7tXr7il7VY+PQQwA11gvZNfPcX5SUM4ToV5H1ug+7rXPn7GWlb9Q==



encoded_string_to_bytes(encrypted_encoded_payload):  b'(\x81F)\x85a\xd3Y\x86)\xe4\xa1o\xe2^@\x17\xfe"\xc0\x01\xce\xdeV`\x7f\xb4\xa
e\x1d96\xcd2\xc8\xbb\xe85"\x12\xbc\x04\xb9!\xb0?p\xdf1I\xdf\xed7\xb7M\xe8\x94z\xafo<\x81]\x0f\xc8\x05\x86\x8dZ\x11.\x04\xb2\xc6\x0
c\xcbZ\x8du\xacS=\x00\xed\x85\xd1\xa7T\xe9\x83\xd4|\xe1\xe4\x94\xb4\xb1\x81+\xba<\x04&VL\xa8\x11\x91\xb0M\x80d\x00\xca\x8f\x8c\x100
\x10|zb\x94Y\x0e\'!\xc4\xd3\xb3\x85^;\\\xdd\x0e\rE\xbb\x82m\xf5\xf1\x05\x94\xad\xaa\xa7G\xdb 3\xf5\xfd#\xf84b#$Y\xa4]\xec\xaf?\xc2\
x9b\xea\x19q\xdb\xd6\xfd\xc9K\xcan#\x96\xc3F]\xe8\xe0O"\xf8\xabT\xaa\xfe\x9b4\xfb\xba\xcf\xacD\xd0u\xb0\xf3\xbbd\xae=(*\xeb\xcf\xc8
  \xf9\r\x87x\xa6\xd5^\xed^\xbe\xe2\x97\xb5X\xf8\xf4\x10\xc0\ru\x82\xf6M|\xf7\x17\xe5%\x0c\xe1:\x15\xe4}n\x83\xee\xeb\\\xf9\xfb\x19
  i[\xf5'

*/