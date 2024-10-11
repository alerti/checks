const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PubNub = require('pubnub');
const React = require('react');
const ReactDOM = require('react-dom');
const { createContext, useContext, useReducer, useState, useEffect, useCallback, memo } = React;

// Webpack Configuration (optimized with caching and source-maps)
const webpackConfig = {
  entry: './src/index.js', // Assuming you'll separate into src folder
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index_bundle.[contenthash].js', // Add contenthash for caching
  },
  devServer: {
    historyApiFallback: true,
    inline: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'], // Use array for multiple loaders
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]'],
      },
      {
        test: /\.(png|jpe?g|webp|svg)$/, // Combined image extensions
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // Inline small images
              name: 'images/[name].[hash].[ext]', // Output to images folder
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Assuming src folder
    }),
  ],
  devtool: 'source-map', // Add source maps for debugging
};

module.exports = webpackConfig;

// PubSub (with error handling)
const pubnubConfig = {
  publishKey: process.env.PUBLISH_KEY, // Use environment variables
  subscribeKey: process.env.SUBSCRIBE_KEY,
};

const MESSAGE_CHANNEL = 'MESSAGE_CHANNEL';

function PubSub() {
  const pubnub = new PubNub(pubnubConfig);
  
  try { // Handle subscribe errors
    pubnub.subscribe({ channels: [MESSAGE_CHANNEL] });
  } catch (error) {
    console.error("PubNub subscribe error:", error);
  }
  
  
  this.addListener = (listenerConfig) => {
    pubnub.addListener(listenerConfig);
  };
  
  this.publish = (message) => {
    pubnub.publish({
      message,
      channel: MESSAGE_CHANNEL,
    }, (status, response) => { // Handle publish errors
      if (status.error) {
        console.error("PubNub publish error:", status, response);
      }
    });
  };
}


// ... (Redux and Context setup remains the same)

// Components (optimized with memoization and useCallback)
const MessageReaction = memo(function MessageReaction({ messageReaction }) {
  return (
    <div>
      {messageReaction?.map(({ id, emoji, username }) => (
        <span key={id}>
            <i>{username}</i> <strong>{emoji}</strong>
          </span>
      ))}
    </div>
  );
});


function CreateReaction({ messageId }) {
  const { state: { username }, pubsub: { publish } } = myContext();
  
  const publicReaction = useCallback(({ type, emoji }) => () => {
    publish(createReaction({ type, emoji, username, messageId }));
  }, [username, publish, messageId]); // Add dependencies
  
  
  return (
    <div>
      {REACTION_OBJECTS.map(({ type, emoji }) => (
        <span key={type} onClick={publicReaction({ type, emoji })}>
          {emoji} {' '}
        </span>
      ))}
    </div>
  );
}


// ... (Other components remain largely the same)


function MessageBoard() {
  const { state: { messages, reactionMaps } } = myContext();
  
  return (
    <div>
      {messages.length ? messages.map((message) => {
        const { id, text, timeStamp, username } = message;
        const messageReactions = reactionMaps[id] || []; // Get reactions or empty array
        return (
          <div key={id}>
            <h4>{new Date(timeStamp).toLocaleString()}</h4>
            <p>{text}</p>
            <h4>- {username}</h4>
            <CreateReaction messageId={id} />
            <MessageReaction messageReaction={messageReactions} /> {/* Pass the reactions array */}
          </div>
        );
      }): "No messages yet"} {/* Improved empty message handling */}
    </div>
  );
}





// App (with cleanup for PubNub listener)
function App() {
  // ... other code
  
  useEffect(() => {
    const listener = {
      message: (messageObject) => {
        const { channel, message } = messageObject;
        
        dispatch(message);
      },
      
    };
    pubsub.addListener(listener);
    
    return () => {
      pubsub.removeListener(listener); // Cleanup listener on unmount
      // You might need a removeListener implementation in your PubNub wrapper
      //  pubsub.unsubscribe({ channels: [MESSAGE_CHANNEL] }); if you are using pubnub directly
    };
  }, []); // Correct dependency array for useEffect
  
  // ... rest of the App component
  
}
