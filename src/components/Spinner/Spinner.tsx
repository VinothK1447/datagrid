import React from 'react'
import classNames from 'classnames'
import { SpinnerProps } from './Spinner.types'
import './styles/spinner.scss'

const defaultProps = {
	size: 'reg',
	disableWrapper: false
}

const Spinner = (props: SpinnerProps) => {
	let { size, classes, color, circleColor, disableWrapper, children, ...attributes } = props

	const classList = classNames('spinner', classes, size && `spinner-${size}`)

	return (
		<div className={disableWrapper ? '' : 'spinner-wrapper flex-center'}>
			<div>
				<div className={classList} {...attributes}></div>
				{children && <span className='spinner-description'>{children}</span>}
			</div>
		</div>
	)
}

Spinner.defaultProps = defaultProps

export default Spinner
