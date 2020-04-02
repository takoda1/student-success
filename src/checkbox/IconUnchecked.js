import React from 'react'

export default class IconUnchecked extends React.Component {

  render() {
    return (
      <svg style={Styles.svg} viewBox="0 0 24 24">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g stroke="black" strokeWidth="2">
            <rect id="Rectangle" x="1.5" y="1.5" width="21" height="21" rx="5" />
          </g>
        </g>
      </svg>
    )
  }
}

const Styles = {
  svg: {
    width: '24px',
    height: '24px'
  }
}
