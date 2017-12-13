import React from 'react';
import * as Ant from 'antd';
import moment from 'moment';
import SVGInline from "react-svg-inline";
const sortKeys = require('sort-keys');
const ethUtil = require('ethereumjs-util');

const cnUtils = require('../../contract/scripts/cnUtils.js');
import ScreenBase from './ScreenBase';


export default class ScreenCertificate extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {
    };

    fetch('http://localhost:3001/api/lookup-cert', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ certHash: this.props.match.params.certHash, address: this.props.match.params.address, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ certStatus: json, });
console.log("YEY",json);
    });
  }

  myRender() {
    if (!this.state.certStatus) {
      return <div>Loading...</div>;
    }

    let cert = this.state.certStatus.cert;

    let rows = [];

    if (cert.validated.domain) rows.push({
      short: 'ethAddr',
      namePretty: 'Ethereum Address',
      value: <a href={`https://etherscan.io/address/${cert.validated.ethAddr}`}>{cert.validated.ethAddr}</a>,
    });

    if (cert.validated.domain) rows.push({
      short: 'domain',
      namePretty: 'Domain Name',
      value: <a href={`https://${cert.validated.domain}`}>{cert.validated.domain}</a>,
    });

    if (cert.validated.email) rows.push({
      short: 'email',
      namePretty: 'Email',
      value: <a href={`mailto:${cert.validated.email}`}>{cert.validated.email}</a>,
    });

    // FIXME: format phone numbers "nicely"

    if (cert.validated.phone) rows.push({
      short: 'phone',
      namePretty: 'Phone',
      value: <span>{cert.validated.phone}</span>,
    });

    if (cert.validated.sms) rows.push({
      short: 'sms',
      namePretty: 'Cell-Phone',
      value: <span>{cert.validated.sms}</span>,
    });

    let issueDate = moment(parseInt(cert.issuedTimestamp) * 1000);

    let revokeStatus;
    if (cnUtils.normalizeHash(this.state.certStatus.certHash) === cnUtils.normalizeHash(this.state.certStatus.latestCertHash)) {
      revokeStatus = <span><Ant.Icon type="check-circle" className="checkmark-small"/> Certificate has not been revoked.</span>;
    } else {
      revokeStatus = <span><Ant.Icon type="exclamation-circle" className="exclm-small"/> Certificate has been replaced by a <a href={`/certificate/${cnUtils.normalizeHash(this.state.certStatus.latestCertHash)}`}>newer certificate</a>.</span>;
    }

    let hashStatus;
    let validatedCertHash = ethUtil.sha3(new Buffer(JSON.stringify(sortKeys(cert, {deep: true})))).toString('hex');
    if (cnUtils.normalizeHash(this.state.certStatus.certHash) === cnUtils.normalizeHash(validatedCertHash)) {
      hashStatus = <span><Ant.Icon type="check-circle" className="checkmark-small"/> Certificate hash matches certificate data.</span>;
    } else {
      hashStatus = <span><Ant.Icon type="exclamation-circle" className="exclm-small"/> Certificate hash does not match certificate data.</span>;
    }

    return (
      <div className="cert-viewer">
        <div className="cert-logo">Cert Ninja</div>

        <div className="validated">
          {rows.map(r => (
            <Ant.Row key={r.namePretty} type="flex">
              <Ant.Col span={2} className="checkmark">
                <Ant.Tooltip title={"Validated on " + moment(parseInt(cert.timestamps[r.short]) * 1000).format()}>
                  <Ant.Icon type="check-square-o" />
                </Ant.Tooltip>
              </Ant.Col>
              <Ant.Col span={8}>
                {r.namePretty}
              </Ant.Col>
              <Ant.Col span={14}>
                <div>{r.value}</div>
              </Ant.Col>
            </Ant.Row>
          ))}
        </div>

        <Ant.Row type="flex">
          <Ant.Col span={18}>
            <div className="cert-extra-checks">
              <div>
                {hashStatus}
              </div>
              <div>
                {revokeStatus}
              </div>
              <div>
                <Ant.Icon type="check-circle" className="checkmark-small"/> Issued on <b>{issueDate.format("[the] Do [day of] MMMM, YYYY")}</b>.
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
