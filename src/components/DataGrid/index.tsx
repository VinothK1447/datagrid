import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { DataGridProps } from '../../types/types'
import Utils from '../../utils/Utils'
import './styles/datagrid.scss'
import { APP_CONSTANTS, STATIC_STRINGS } from '../../utils/Constants'
import Spinner from '../Spinner/Spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

function DataGrid(props: DataGridProps) {
	const ROW_CAP = APP_CONSTANTS.ROWS_PER_PAGE
	const { data, headers, totalPages = 0, theme, bordered } = props
	// Refs for loader and last element indicator
	const loader = useRef<any>(null)
	const lastElemRef = useRef<HTMLDivElement>(null)

	// State related to data values
	const [allData, setAllData] = useState(data)
	const [lastIndex, setLastIndex] = useState(0)
	const [fragmentedData, setFragmentedData] = useState<{}[]>([])

	// State related to pagination
	const [pageNum, setPageNum] = useState(0)
	const [showSpinner, setShowSpinner] = useState(false)

	// State related to sort
	const [sort, setSort] = useState({ field: 'SYMBOL', order: 'asc' })

	// State related to filter
	const [filterField, setFilterField] = useState('')

	// Icons - sort, filter
	const sortAsc = <FontAwesomeIcon icon={faSortUp} />
	const sortDesc = <FontAwesomeIcon icon={faSortDown} />
	const filterIcon = <FontAwesomeIcon icon={faFilter} />

	useEffect(() => {
		if (!Utils.isEmpty(allData)) {
			sliceData()
			setShowSpinner(true)
		}
	}, [allData])

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
	}, [lastIndex, sort])

	const sliceData = () => {
		setTimeout(() => {
			let currentData
			if (lastElemRef?.current) {
				currentData = [...fragmentedData, ...allData.slice(lastIndex, lastIndex + ROW_CAP)]
			} else {
				currentData = [...fragmentedData, ...allData.slice(0, ROW_CAP)]
			}
			currentData = Utils.sortData(currentData, sort)
			setLastIndex(lastIndex + ROW_CAP)
			setPageNum(pageNum + 1)
			setFragmentedData(currentData)
			if (pageNum === totalPages - 1) {
				setShowSpinner(false)
			}
		}, 1000)
	}

	useEffect(() => {
		if (!Utils.isEmpty(fragmentedData)) {
			let currentData = Utils.sortData(fragmentedData, sort)
			setSort(sort)
			setFragmentedData(currentData)
		}
	}, [fragmentedData, sort])

	const handleSort = (e: React.MouseEvent) => {
		let elem = e.target as HTMLDivElement | HTMLSpanElement | any
		if (elem.tagName !== 'DIV') {
			elem = elem.closest('.data-grid-header-cell')
		}
		let elemDataKey = elem.dataset.key as any
		let elSortOrder = elem.dataset.order as any
		elSortOrder = elSortOrder === 'desc' ? 'asc' : 'desc'
		let sortItems = [...fragmentedData]
		sortItems = Utils.sortData(fragmentedData, { field: elemDataKey, order: elSortOrder })
		setSort({ field: elemDataKey, order: elSortOrder })
		setFragmentedData(sortItems)
	}

	const generateHeader = () => {
		return headers.map((_hdr: String, idx: number) => {
			return (
				<div
					key={`${_hdr}-${idx}`}
					className={classNames('data-grid-header-cell', theme && `${theme}-header-cell`)}
					data-key={_hdr}
					data-order={sort.order}
					onClick={handleSort}
				>
					{_hdr} {sort.field === _hdr ? <span>{sort.order === 'asc' ? sortAsc : sortDesc}</span> : null}{' '}
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
				{fragmentedData && fragmentedData.length > 0 ? <>{generateCells()}</> : <React.Fragment key='data-grid-no-data-cells'>{generateEmptyView()}</React.Fragment>}
			</div>
			{showSpinner && (
				<div ref={loader} className={'loading'}>
					<Spinner />
				</div>
			)}
		</>
	)
}

export default DataGrid
