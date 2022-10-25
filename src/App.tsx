import React, { useLayoutEffect } from 'react'
import './styles/app.scss'
import FileUploader from './components/FileUpload'
import { STATIC_STRINGS } from './utils/Constants'
import ErrorBoundary from './components/ErrorBoundary'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons'

function App() {
	useLayoutEffect(() => {
		document.querySelector('html')!.setAttribute('data-theme', 'light')
		window.localStorage.setItem('theme', 'light')
	}, [])

	const changeTheme = () => {
		let htmlEl = document.querySelector('html')!
		let htmlElDataset = htmlEl.dataset?.theme
		if (htmlElDataset === 'light') {
			document.querySelector('html')!.setAttribute('data-theme', 'dark')
			window.localStorage.setItem('theme', 'dark')
		} else if (htmlElDataset === 'dark') {
			document.querySelector('html')!.setAttribute('data-theme', 'light')
			window.localStorage.setItem('theme', 'light')
		}
	}

	return (
		<div className='container'>
			<div className='container-main'>
				<div className='header'>
					<span className='header-text'>{STATIC_STRINGS.HEADER_TEXT}</span>
					<FontAwesomeIcon icon={faCircleHalfStroke} onClick={changeTheme} />
				</div>
				<div className='content'>
					<div className='info-message font-700'>{STATIC_STRINGS.INFO_MESSAGE}</div>
					<div className='file-uploader-container'>
						<ErrorBoundary>
							<FileUploader />
						</ErrorBoundary>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
