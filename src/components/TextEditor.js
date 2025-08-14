import React from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0';
import ReactQuill from "https://cdn.skypack.dev/react-quill@2.0.0";
class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.customToolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ];
  }

  handleChange(value) {
    this.setState({ value });
  }

  handleSubmit(e) {
    e.preventDefault();
    // Send data to parent if callback provided, else log
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.value);
    } else {
      alert('Submitted content:\n' + this.state.value);
    }
  }

  render() {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '24px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <label style={{
          fontWeight: 'bold',
          fontSize: '18px',
          marginBottom: '12px',
          display: 'block'
        }}>
          Enter your content:
        </label>
        <form onSubmit={this.handleSubmit}>
          <ReactQuill
            theme="snow"
            className="text-editor"
            value={this.state.value}
            onChange={this.handleChange}
            modules={{ toolbar: this.customToolbarOptions }}
            placeholder="Type here..."
            style={{
              height: '200px',
              marginBottom: '16px',
              background: '#fff',
              borderRadius: '4px'
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '8px 24px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }
}

class App extends React.Component {
  handleEditorSubmit = (data) => {
    // You can handle submitted data here (e.g., send to API)
    console.log('Editor submitted:', data);
  };

  render() {
    return (
      <div className="app">
        <TextEditor onSubmit={this.handleEditorSubmit} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
export default TextEditor;
