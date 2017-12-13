import React from 'react';
import * as Ant from 'antd';
import SVGInline from "react-svg-inline";
import {Redirect, Link} from 'react-router-dom';

import ScreenBase from './ScreenBase';


export default class ScreenHomePage extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  myRender() {
    return (
      <div className="homepage-screen">
        <SVGInline svg={require('./splash-logo.svg')} height="200px" />
        <Ant.Input
          placeholder="Ethereum address or certificate hash"
          size="large"
          style={{ width: 700, }}
          onChange={(v) => this.setState({ searchVal: v.target.value, })}
          onPressEnter={() => this.doSearch()}
        />
        <Ant.Button size="large" onClick={() => this.doSearch()} disabled={this.state.searchVal === undefined || this.state.searchVal.length === 0}>Search</Ant.Button>
        {this.state.searchError && <span style={{ color: 'red', }}>{this.state.searchError}</span>}

        <span>
          <Link to="/learn-more">What is this?</Link> &mdash; <Link to="/certify-address">Certify your own address!</Link>
        </span>
      </div>
    );
  }

  doSearch() {
    let searchVal = this.state.searchVal;
    if (searchVal === undefined || searchVal === '') return;
    searchVal = searchVal.trim();

    fetch('http://localhost:3001/api/lookup-cert', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ search: searchVal, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState({ certStatus: json, });
      if (json.found === 'addr') {
        this.props.history.push(`/address/${json.cert.validated.ethAddr}`);
      } else if (json.found === 'hash') {
        this.props.history.push(`/certificate/${json.certHash}`);
      }
    }).catch((err) => {
        this.setState({ searchError: "Not found", });
    });
  }
}
