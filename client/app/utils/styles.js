
const text = {
  fontFamily: 'Acme'
};

const label = Object.assign({}, text, {
  color: '#fff',
  fontSize: '32px',
});

const title = Object.assign({}, label, {
  align: 'center',
  backgroundColor: '#2DAA58',
  fontSize: '64px'
});

const button = Object.assign({}, label, {
  fontSize: '64px',
  align: 'center',
});

const primaryButton = Object.assign({}, button, {
  backgroundColor: '#2B67AB'
});

const secondaryButton = Object.assign({}, button, {
  backgroundColor: '#444'
});

const negativeButton = Object.assign({}, button, {
  backgroundColor: '#E95C3B'
});

const explanation = Object.assign({}, label, {
  backgroundColor: '#333333',
  wordWrap: { width: 1160 }
});

const monospaceLabel = Object.assign({}, label, {
  fontFamily: 'Courier',
  fontSize: '22px',
  backgroundColor: '#333333',
  wordWrap: { width: 1200 }
});

const styles = {
  text,
  label,
  title,
  button,
  primaryButton,
  secondaryButton,
  negativeButton,
  explanation,
  monospaceLabel
};

export default styles;
