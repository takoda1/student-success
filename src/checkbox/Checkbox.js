import React from 'react'
import IconCheck from './IconCheck'
import IconUnchecked from './IconUnchecked'


/* all code for this custom checkbox was created by and taken from: https://stackblitz.com/edit/react-custom-checkbox */
export default class Button extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: props.completed
    }

    this.icon = this.icon.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  icon() {
    return this.state.checked ? <IconCheck /> : <IconUnchecked />
  }

  toggle(event) {
    event.preventDefault()
      this.props.onToggle();
      this.setState(function (state, props) {
      return {
        checked: !state.checked
      }
    })
    
  }

  render() 
  {
    if(typeof this.props.onToggle !== "undefined") {
      var thisButton = 
      <button style={ Styles.button} onClick={ this.toggle }>
          <div style={ Styles.check }> { this.icon() } </div>
          <div style={ Styles.content }> { this.props.children } </div>
    </button>
    }
    else {
      var thisButton = 
      <button disabled style={ Styles.button} >
          <div style={ Styles.check }> { this.icon() } </div>
          <div style={ Styles.content }> { this.props.children } </div>
      </button>
    }
    return (
      <span>
        {thisButton}
      </span>
    )
  }
}

const Styles = {
  button: {
    background: 'transparent',
    border: '0',
    marginBottom: '0.5rem',
    fontSize: '1em',
    display: 'flex',
    outline: '0',
    color: 'black',
    marginRight: '0.5rem',
    textAlign: 'left'
  },

  check: {
    marginRight: '1rem'
  },

  content: {
    paddingTop: '0.2rem',
    lineHeight: '1.25rem',
  }
}