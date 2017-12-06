import React from 'react';
import * as Ant from 'antd';
import moment from 'moment';
import SVGInline from "react-svg-inline";

import ScreenBase from './ScreenBase';


export default class ScreenCertificate extends ScreenBase {
  myRender() {
    let cert = {
      ethAddr: '0x2Df4c69BF8980011fce9ed182f7336F5Af757c26',
      validated: {
        domain: 'www.example.com',
        email: 'support@example.com',
        phone: '+12125551212',
      },
      nonce: '13uGSLDenSqWNFo3AIbXIz',
      timestamp: '1512589368',
    };

    let rows = [];

    rows.push({
      namePretty: 'Ethereum Address',
      value: <a href={`https://etherscan.io/address/${cert.ethAddr}`}>{cert.ethAddr}</a>,
    });

    if (cert.validated.domain) rows.push({
      namePretty: 'Domain Name',
      value: <a href={`https://${cert.validated.domain}`}>{cert.validated.domain}</a>,
    });

    if (cert.validated.email) rows.push({
      namePretty: 'Email',
      value: <a href={`mailto:${cert.validated.email}`}>{cert.validated.email}</a>,
    });

    // FIXME: format phone numbers "nicely"

    if (cert.validated.phone) rows.push({
      namePretty: 'Phone',
      value: <span>{cert.validated.phone}</span>,
    });

    if (cert.validated.sms) rows.push({
      namePretty: 'Cell-Phone',
      value: <span>{cert.validated.sms}</span>,
    });

    let date = moment(parseInt(cert.timestamp) * 1000);

    return (
      <div className="cert-viewer">
        <div className="cert-logo">Cert Ninja</div>

        <div className="validated">
          {rows.map(r => (
            <Ant.Row key={r.namePretty} type="flex">
              <Ant.Col span={2} className="checkmark">
                <Ant.Icon type="check-square-o" />
              </Ant.Col>
              <Ant.Col span={8}>
                {r.namePretty}
              </Ant.Col>
              <Ant.Col span={14}>
                {r.value}
              </Ant.Col>
            </Ant.Row>
          ))}
        </div>

        <Ant.Row type="flex">
          <Ant.Col span={18}>
            <div className="cert-extra-checks">
              <div>
                <Ant.Icon type="check-circle" className="checkmark-small"/> Certificate hash matches certificate data.
              </div>
              <div>
                <Ant.Icon type="check-circle" className="checkmark-small"/> Certificate has not been revoked.
              </div>
              <div>
                <Ant.Icon type="check-circle" className="checkmark-small"/> Validated on <b>{date.format("[the] Do [day of] MMMM, YYYY")}</b>.
              </div>
            </div>

            <div className="cert-info-tags">
              <Ant.Popover placement="top" content={<pre>679517167b450673692471cf4d57ad9a3c41a16cbe7d4f05cb4eeeda55a7b434</pre>} title="Certificate Hash">
                <Ant.Tag color="blue">Certificate Hash</Ant.Tag>
              </Ant.Popover>

              <Ant.Popover placement="top" content={<pre>{JSON.stringify(cert, null, '    ')}</pre>} title="Raw Certificate">
                <Ant.Tag color="blue">Raw Certificate</Ant.Tag>
              </Ant.Popover>
            </div>
          </Ant.Col>
          <Ant.Col span={6}>
            <SVGInline svg={require('./cert-ninja-seal.svg')} height="200px" />
          </Ant.Col>
        </Ant.Row>
      </div>
    );
  }
}
