import React from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect, Link} from 'react-router-dom';

import * as Ant from 'antd';
import { Layout, Menu, Icon, Breadcrumb } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import 'antd/dist/antd.css';

import ScreenHomePage from './ScreenHomePage';
import ScreenCertifyAddress from './ScreenCertifyAddress';
import ScreenCertificate from './ScreenCertificate';
import ScreenRequest from './ScreenRequest';
import ScreenLearnMore from './ScreenLearnMore';


export default class SCLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      selectedTab: location.pathname,
    };
  }

  render() {
    return (
      <Router ref="router">
        <Layout className="cert-ninja-layout">
          <Header>
            <div className="logo"><Link style={{ color: '#009200', }} to="/">Cert Ninja</Link></div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[]}
              style={{ lineHeight: '64px' }}
              onClick={this.menuClicked.bind(this)}
            >
              <Menu.Item key="/learn-more">Learn More</Menu.Item>
              <Menu.Item key="/certify-address">Certify an Address</Menu.Item>
            </Menu>
          </Header>

          <Switch>
            <Route path="/certify-address" component={ScreenCertifyAddress} />
            <Route path="/certificate/:certHash" exact component={ScreenCertificate} />
            <Route path="/address/:address" exact component={ScreenCertificate} />
            <Route path="/request/:invoiceSecret" exact component={ScreenRequest} />
            <Route path="/learn-more" component={ScreenLearnMore} />
            <Route path="/" exact component={ScreenHomePage} />
            <Redirect to="/" />
          </Switch>

          <Footer style={{ textAlign: 'center' }}>
            Cert Ninja ©2017
          </Footer>
        </Layout>
      </Router>
    );
  }

  menuClicked({key}) {
    this.setState({ selectedTab: key, });
    this.refs.router.history.push(key);
  }
}
