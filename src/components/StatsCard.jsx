import React from 'react'

function StatsCard(props) {
  const Icon = props.icon
  return (
    <div
    className='
    flex
    flex-col
    rounded-xl
    gap-7
    bg-gray-900/80
    text-white
    p-5
    border
    border-gray-800
    shadow-sm
    shadow-black/20
    transition-colors
    hover:border-green-900
    '>
        {!Icon ?
        <>
        <div
        className='
        flex
        justify-between
        '>
            <h1 className='text-sm font-medium text-gray-400'>Active Members</h1>
            <img
            className='
            w-6
            h-6
            '
            ></img>
        </div>
        <div
        className='
        flex
        flex-col
        justify-between
        align-start
        '>
            <h1 className='text-3xl font-bold tracking-tight'>{props.num}</h1>
            <div className='flex items-center justify-start gap-1'>
                <p className={`text-[12px] ${props.percentDiff ? props.percentDiff > 0 ? 'text-green-500' : 'text-red-500' : ''}`}>{props.percentDiff ? `${props.percentDiff > 0 ? '+' : ''}${props.percentDiff}%` : ''}</p>
                <p className='text-[12px]'>{props.percentDiff ? ` from ${props.percentFrom}` : ''}</p>
            </div>
        </div>

        </>
        :
        <>
          <div
        className='
        flex
        justify-between
        '>
            <h1 className='text-sm font-medium text-gray-400'>{props.title}</h1>
            <Icon
            className='
            w-5
            h-5
            text-green-500
            '
            />
        </div>
        <div
        className='
        flex
        flex-col
        justify-between
        align-start
        '>
            <h1 className='text-3xl font-bold tracking-tight'>{props.num ? props.num:'0'}</h1>
            <div className='flex items-center justify-start gap-1'>
                <p className={`text-[12px] ${props.percentDiff ? props.percentDiff > 0 ? 'text-green-500' : 'text-red-500' : ''}`}>{props.percentDiff ? `${props.percentDiff > 0 ? '+' : ''}${props.percentDiff}%` : ''}</p>
                <p className='text-[12px] text-gray-400'>{props.percentDiff ? ` from ${props.percentFrom}` : ''}</p>
            </div>
        </div>
        </>}
    </div>
  )
}

export default StatsCard
