import React from 'react';
import * as Ant from 'antd';
import {Link} from 'react-router-dom';

import ScreenBase from './ScreenBase';


export default class ScreenLearnMore extends ScreenBase {
  myRender() {
    return (
      <div className="learn-more-screen">
        <h2>What is Cert Ninja?</h2>

        <div>
          Cert Ninja is a protocol and platform for proving that an Ethereum address is owned by a certain individual or company. We are EV Certificates for the Blockchain.
        </div>

        <div>
          Our service provides an assurance for users who may be unwilling to interact with an anonymous ethereum address. With Cert Ninja, your customers can validate that your Ethereum address is associated with your company's domain name, email address, phone number, physical mailing address, or some combination thereof. The verification can be performed via our website or the blockchain itself.
        </div>

        <div>
          After certifying an address, you will receive a link to your certificate, as well as a snippet of HTML code that allows you to embed a Cert Ninja verification badge that links to your certificate. Here is an example badge:
        <div>

        </div>
          <a title="Verified by Cert Ninja" href="https://cert.ninja/address/0x6F794648E66e4bB155977e07447eA60f864cF816"><img src="https://cert.ninja/verified.png" /></a>
        </div>

        <h2>I'm convinced. How can I certify my address?</h2>

        <ol>
          <li>Visit our <Link to="/certify-address">certify address page</Link>.</li>
          <li>Enter your Ethereum address and select your certification options (email is required).</li>
          <li>We will send you an email. Click the link in this email.</li>
          <li>Pay the invoiced amount using <a href="https://metamask.io">MetaMask</a> and the ethereum address you entered above.</li>
          <li>Complete any additional steps required for your certification options.</li>
          <li>Click the Certify Address button.</li>
          <li>Congratulations, your address is now certified!</li>
        </ol>
      </div>
    );
  }
}
