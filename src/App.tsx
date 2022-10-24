import React from 'react'
import './styles/app.scss'
import FileUploader from './components/FileUpload'
import { STATIC_STRINGS } from './utils/Constants'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
	return (
		<div className='container'>
			<div className='container-main'>
				<div className='header'>
					<span className='header-text'>{STATIC_STRINGS.HEADER_TEXT}</span>
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
