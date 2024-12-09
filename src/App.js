import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import amplifyConfig from './aws-exports';
import AudioSplitter from './AudioSplitter';
import './App.css';

Amplify.configure(amplifyConfig);

export function App({ signOut, user }) {
  return (
    <>
      <AudioSplitter />
      <button className='sign-out-button' onClick={signOut}>Sign out</button>
    </>
  );
}

export default withAuthenticator(App);