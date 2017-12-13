import React from 'react';
import * as Ant from 'antd';

export default class ScreenBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.initialState();
  }

  render() {
    return (
      <Ant.Layout.Content style={this.contentStyle()}>
        <div style={this.containerStyle()}>
          {this.myRender()}
        </div>
      </Ant.Layout.Content>
    );
  }

  // Over-rides

  initialState() { return {}; }
  contentStyle() { return { padding: '0 50px', }; }
  containerStyle() { return { padding: 24, background: '#fff', minHeight: 360, }; }
}
