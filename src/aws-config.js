import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    region: "ap-south-1", // e.g., "us-east-1"
    userPoolId: "ap-south-1_dRe881feX", // Replace with your Cognito User Pool ID
    userPoolWebClientId: "5lis4pao40gc8psnhabf55g2e4", // Replace with your App Client ID
    identityPoolId: "ap-south-1:09ce4055-e4d8-4940-832e-a48e8855276b", // Replace with your Identity Pool ID
  },
};

// Configure Amplify with the config object
Amplify.configure(awsConfig);

export default awsConfig;
