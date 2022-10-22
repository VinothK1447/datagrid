import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { DataGridProps } from '../../types/types'
import Utils from '../../utils/Utils'
import './styles/datagrid.scss'
import { APP_CONSTANTS, STATIC_STRINGS } from '../../utils/Constants'

function DataGrid(props: DataGridProps) {
	const ROW_CAP = APP_CONSTANTS.ROWS_PER_PAGE
	const { data, headers, theme, bordered } = props
	const loader = useRef<any>(null)
	const lastElemRef = useRef<HTMLDivElement>(null)
	const [allData, setAllData] = useState(data)
	const [lastIndex, setLastIndex] = useState(0)
	const [fragmentedData, setFragmentedData] = useState<{}[]>([])

	useEffect(() => {
		sliceData()
	}, [data])

	useEffect(() => {
		const opts = {
			root: null,
			rootMargin: '0px 0px 25px 0px',
			threshold: 0.5
		}
		const cb = (entries: any) => {
			if (entries[0].isIntersecting) {
				sliceData()
			}
		}
		loader.current = new IntersectionObserver(cb, opts)
		if (lastElemRef.current) {
			loader.current.observe(lastElemRef.current)
		}
	}, [lastIndex])

	const sliceData = () => {
		if (lastElemRef?.current) {
			setFragmentedData([...fragmentedData, ...data.slice(lastIndex, lastIndex + ROW_CAP)])
		} else {
			setFragmentedData([...fragmentedData, ...data.slice(0, ROW_CAP)])
		}
		setLastIndex(lastIndex + ROW_CAP)
	}

	const generateHeader = () => {
		return headers.map((_hdr: String, idx: number) => {
			return (
				<div key={`${_hdr}-${idx}`} className={classNames('data-grid-header-cell', theme && `${theme}-header-cell`)}>
					{_hdr}
				</div>
			)
		})
	}

	const generateCells = () => {
		return fragmentedData.map((_data: any, _idx: number) => {
			return (
				<div
					className={classNames('data-grid-content-row', bordered && `data-grid-content-row-bordered ${theme}-content-row-bordered`)}
					key={`content-row-${_idx}`}
					{...(_idx === lastIndex - 1 && { ref: lastElemRef, id: `cellId-${_idx}` })}
				>
					{headers.map((_hdr: any, _indx: number) => (
						<div className={classNames('data-grid-content-cell', theme && `${theme}-content-cell`)} key={`${_hdr}-${_indx}${_idx}`}>
							{_data[_hdr]}
						</div>
					))}
				</div>
			)
		})
	}
	const generateEmptyView = () => {
		return (
			<div className={classNames('data-grid-no-data-section', theme && `${theme}-no-data-section`)}>
				<span
					dangerouslySetInnerHTML={{
						__html: STATIC_STRINGS.NO_DATA_MESSAGE
					}}
				></span>
			</div>
		)
	}

	return (
		<>
			<div className={classNames('data-grid', bordered && 'bordered')}>
				{headers && <div className={classNames('data-grid-header-row', 'data-grid-header-row-fixed', theme && `${theme}-header-row`)}>{generateHeader()}</div>}
				{fragmentedData ? <>{generateCells()}</> : <React.Fragment key='data-grid-no-data-cells'>{generateEmptyView()}</React.Fragment>}
			</div>
			<div ref={loader}>Loading...</div>
		</>
	)
}

export default DataGrid
