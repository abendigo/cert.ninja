import React from 'react';
import * as Ant from 'antd';

import ScreenBase from './ScreenBase';



 

export default class ScreenCertifyAddress extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {};

    let myInit = { method: 'GET', mode: 'cors', cache: 'default' };

    fetch('http://localhost:3001/api/get-rates', myInit).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ pricing: json, });
    });
  }

  myRender() {
    let fields = [
      {
        name: 'ethaddr',
        namePretty: 'Ethereum Address',
        desc: <div>The Ethereum address you wish to certify.</div>,
        placeholder: 'ethereum address',
        type: 'input',
        required: true,
      },
      {
        name: 'email',
        namePretty: 'Email Address',
        desc: <div>We will send you an email with a URL that you must click.</div>,
        placeholder: 'email address',
        type: 'input',
        time: '5 minutes',
      },
      {
        name: 'domain',
        namePretty: 'Domain Name',
        desc: <div>We will provide a file that you must put on an https URL on the provided domain.</div>,
        placeholder: 'domain name',
        type: 'input',
        time: '5 minutes',
      },
      {
        name: 'sms',
        namePretty: 'SMS (Text Message)',
        desc: <div>We will send an SMS to a phone number containing a short code that you must enter on our site.</div>,
        placeholder: 'phone number (cell-phone only)',
        type: 'input',
        time: '10 minutes',
      },
      {
        name: 'phone',
        namePretty: 'Phone Call',
        desc: <div>We will call your number and read out a short code that you must enter on our site.</div>,
        placeholder: 'phone number',
        type: 'input',
        time: '1 hour',
      },
      {
        name: 'snailmail',
        namePretty: 'Mailing Address',
        desc: <div>We will send a letter via post to this address containing a short code that you must enter on our site.</div>,
        type: 'mailing',
        time: '2 weeks',
      }
    ];

    if (!this.state.pricing) return <div>Loading...</div>;

    return (
      <div className="certify-address">
        <h1>Certify Address</h1>

        {fields.map(f => (
          <Ant.Card key={f.name} title={f.namePretty} style={{ marginTop: 15, }}>
            <Ant.Row type="flex">
              <Ant.Col span={6}>
                {f.desc}
              </Ant.Col>

              <Ant.Col span={6} style={{ marginLeft: 20, marginRight: 20, }}>
                <div style={{ marginBottom: 20, }}>
                  {f.required ? <Ant.Tag color="cyan">Required</Ant.Tag> : <Ant.Switch />}
                </div>

                {f.type === 'input' ? (
                  <Ant.Input placeholder={f.placeholder} />
                ) : f.type === 'mailing' ? (
                  <div>
                    <Ant.Input placeholder={"address line 1"} /><br/>
                    <Ant.Input placeholder={"address line 2"} /><br/>
                    <Ant.Input placeholder={"country"} /><br/>
                    <Ant.Input placeholder={"state/province"} /><br/>
                    <Ant.Input placeholder={"postal code"} /><br/>
                  </div>
                )
                 : null
                }
              </Ant.Col>

              <Ant.Col span={4}>
                {this.state.pricing.pricing[f.name] && <div>
                  Cost: ${this.state.pricing.pricing[f.name].toFixed(2)} (0.019 ETH)
                </div>}

                {f.time !== undefined && <div>
                  Time: Approximately {f.time}
                </div>}
              </Ant.Col>
            </Ant.Row>
          </Ant.Card>
        ))}

        <Ant.Button type="primary">Certify Address</Ant.Button>
      </div> 
    );
  }
}
