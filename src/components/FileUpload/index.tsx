import React, { useRef, useState } from 'react'
import { STATIC_STRINGS } from '../../utils/Constants'
import Utils from '../../utils/Utils'
import DataGrid from '../DataGrid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'

const FileUploader = () => {
	const fileInputBtn = useRef<any>()
	const [csvFile, setCsvFile] = useState<any>()
	const [csvArray, setCsvArray] = useState<any>()
	const [headers, setHeaders] = useState<string[]>([])
	const [totalPages, setTotalPages] = useState(0)
	const [fileStatus, setFileStatus] = useState<any>(null)

	const submit = () => {
		const file: any = csvFile
		const reader = new FileReader()
		reader.onload = function (e: any) {
			const text: string = e.target.result
			let { headers, dataArray, totalPages } = Utils.processCSV(text)
			setCsvArray(dataArray)
			setHeaders(headers)
			setTotalPages(totalPages)
		}
		reader.readAsText(file)
	}

	const updateFile = (e: React.ChangeEvent) => {
		let elem = e.target as any
		const file = elem.files[0]
		if (file && file.size > -1) {
			setFileStatus('success')
		}
		if (!file) {
			setFileStatus('error')
		}
		setCsvFile(file)
	}

	const parseCSVFile = (e: React.MouseEvent) => {
		e.preventDefault()
		if (csvFile) {
			submit()
		}
	}

	const uploadFile = () => {
		fileInputBtn.current.click()
	}

	const removeFile = () => {
		fileInputBtn.current.value = null
		setCsvFile(null)
		setFileStatus(null)
	}

	return (
		<>
			<div className='upload-section'>
				<input ref={fileInputBtn} type='file' accept='.csv' onChange={updateFile} className={'file-input'} />
				<FontAwesomeIcon icon={faCloudArrowUp} size={'3x'} onClick={uploadFile} className={'file-input-icon'} />
				{fileStatus && fileStatus === 'success' ? <FontAwesomeIcon icon={faCircleCheck} size={'2x'} className={'file-upload-success'} /> : null}
				{fileStatus && fileStatus === 'error' ? <FontAwesomeIcon icon={faCircleXmark} size={'2x'} className={'file-upload-error'} /> : null}
				<button onClick={parseCSVFile} className={classNames('primary-btn', !csvFile && 'disabled')}>
					{STATIC_STRINGS.PARSE_CSV_BTN_TXT}
				</button>
				<button onClick={removeFile} className={'tertiary-btn'}>
					{STATIC_STRINGS.CLEAR_BTN_TEXT}
				</button>
			</div>
			<div className='datagrid-section'>{headers && csvArray && <DataGrid data={csvArray} headers={headers} bordered={true} totalPages={totalPages} />}</div>
		</>
	)
}

export default FileUploader
