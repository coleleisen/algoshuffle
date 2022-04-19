import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error : "" };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, error : error };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.log(error)
      console.log(errorInfo)
      
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return(
          <div>
          <h1>Error.</h1>
          <h3>{this.state.error}</h3>
          </div>
        ) 
      }
  
      return this.props.children; 
    }
  }
  export default ErrorBoundary