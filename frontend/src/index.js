import React from 'react';
import {render} from 'react-dom';

import Layout from './Layout';
import './styles.scss';

{
  let app = document.querySelector('#cert-ninja-app');
  if (app) {
    render(<Layout />, app);
  }
}
