import React, { useState } from 'react'
import { STATIC_STRINGS } from '../../utils/Constants'
import Utils from '../../utils/Utils'
import DataGrid from '../DataGrid'

const FileUploader = () => {
	const [csvFile, setCsvFile] = useState()
	const [csvArray, setCsvArray] = useState<any>()
	const [headers, setHeaders] = useState<string[]>([])

	const submit = () => {
		const file: any = csvFile
		const reader = new FileReader()
		reader.onload = function (e: any) {
			const text: string = e.target.result
			let { headers, dataArray } = Utils.processCSV(text)
			setCsvArray(dataArray)
			setHeaders(headers)
		}
		reader.readAsText(file)
	}

	const updateFile = (e: React.ChangeEvent) => {
		let elem = e.target as any
		const file = elem.files[0]
		setCsvFile(file)
	}

	const parseCSVFile = (e: React.MouseEvent) => {
		e.preventDefault()
		if (csvFile) {
			submit()
		}
	}

	return (
		<>
			<div className='upload-section'>
				<input type='file' accept='.csv' onChange={updateFile} />
				<button onClick={parseCSVFile}>{STATIC_STRINGS.PARSE_CSV_BTN_TXT}</button>
			</div>
			<div className='datagrid-section'>{headers && csvArray && <DataGrid data={csvArray} headers={headers} bordered={true} />}</div>
		</>
	)
}

export default FileUploader
