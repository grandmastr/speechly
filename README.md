# Speechly - AI Text-to-Speech

Speechly is a React component that provides text-to-speech functionality using the Speechify API. It allows users to:

- Record or upload audio samples to clone voices
- Select from available voices
- Convert text to speech using selected voices
- Read selected text on a webpage

## Installation

```bash
npm install speechly
```

## Usage

### Basic Usage

```jsx
import { Speechly } from 'speechly';

function App() {
  // The API key is required
  const apiKey = process.env.REACT_APP_SPEECHIFY_API_KEY;

  return (
    <div>
      <h1>My App</h1>
      <Speechly apiKey={apiKey} />
    </div>
  );
}
```

### API Key Management

The Speechly component requires an API key to function. We recommend storing your API key in an environment variable
rather than hardcoding it in your source code:

```jsx
import { Speechly } from 'speechly';

function App() {
  // Best practice: Store API key in environment variables
  const apiKey = process.env.REACT_APP_SPEECHIFY_API_KEY;

  // Optional: Provide user information for voice cloning consent
  const userFullName = "John Doe";
  const userEmail = "john.doe@example.com";

  return (
    <div>
      <h1>My App</h1>
      <Speechly 
        apiKey={apiKey} 
        fullName={userFullName}
        email={userEmail}
      />
    </div>
  );
}
```

For different frameworks, you might need to use different environment variable naming:

- Create React App: `REACT_APP_SPEECHIFY_API_KEY`
- Next.js: `NEXT_PUBLIC_SPEECHIFY_API_KEY`
- Vite: `VITE_SPEECHIFY_API_KEY`

Storing API keys in environment variables helps keep them secure and makes it easier to use different keys in
development and production environments.

## Features

- **Voice Cloning**: Record or upload audio samples to create custom voices
- **Voice Selection**: Choose from available voices, including your cloned voices
- **Text-to-Speech**: Convert text to speech using the selected voice
- **Text Selection**: Select text on the page and have it read aloud
- **Customizable API Key**: Provide your own Speechify API key as a prop
- **Consent Management**: Provide user information for voice cloning consent via props

## Props

| Prop     | Type   | Required | Description                                                                   |
|----------|--------|----------|-------------------------------------------------------------------------------|
| apiKey   | string | Yes      | Your Speechify API key. We recommend storing this in an environment variable. |
| fullName | string | No       | User's full name for consent data when cloning voices.                        |
| email    | string | No       | User's email for consent data when cloning voices.                            |

## Development

This project is built with React, TypeScript, and Vite.

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/grandmastr/speechly.git
   cd speechly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the package:
   ```bash
   npm run build
   ```

### Testing

The project uses Vitest for testing. To run the tests:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Getting a Speechify API Key

To use Speechly, you'll need a Speechify API key:

1. Sign up for an account at [Speechify API](https://speechify.com/)
2. Navigate to your account settings or developer dashboard
3. Generate a new API key
4. Use this key in your application either as a prop or as an environment variable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
