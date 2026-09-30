import { Component } from 'react';
import SomethingWentWrong from './SomethingWentWrong.jsx';

// Catches render errors anywhere below it. "Try again" clears the failure and renders the children again,
// with no page reload. Request errors do not reach it: those are handled by each screen.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  reset = () => this.setState({ failed: false });

  render() {
    return this.state.failed ? <SomethingWentWrong onRetry={this.reset} /> : this.props.children;
  }
}
