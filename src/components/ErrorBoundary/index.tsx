import React, { Component, ReactNode } from 'react'

type DefaultProps = {
	children?: ReactNode
}

type DefaultState = {
	error?: string
}

class ErrorBoundary extends Component<DefaultProps, DefaultState> {
	constructor(props: DefaultProps) {
		super(props)
		this.state = { error: '' }
	}

	componentDidCatch(error: any) {
		this.setState({ error: `${error.name}: ${error.message}` })
	}

	render() {
		const { error } = this.state
		{
			return error ? <div style={{ margin: 'auto', fontWeight: 900, overflowWrap: 'break-word' }}>{error}</div> : <>{this.props.children}</>
		}
	}
}

export default ErrorBoundary
