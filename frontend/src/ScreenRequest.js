import React from 'react';
import * as Ant from 'antd';
import moment from 'moment';
import SVGInline from "react-svg-inline";

import ScreenBase from './ScreenBase';


export default class ScreenCertificate extends ScreenBase {
  constructor(props) {
    super(props);

    this.state = {
    };

    fetch('http://localhost:3001/api/invoice-status', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ invoiceSecret: props.match.params.invoiceSecret, }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json();
    }).then((json) => {
      console.log("YEY",json);
      this.setState({ invoice: json, });
    });
  }

  myRender() {
    return (
      <div className="cert-request">
        Hello!
      </div>
    );
  }
}
