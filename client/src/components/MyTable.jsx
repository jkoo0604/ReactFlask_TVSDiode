import React from 'react';

import colors from '../config/colors';

const MyTable = props => {
    const {data, tdStyle, thStyle} = props;

    return (
        <table>
            <thead>
                <tr>
                    <th style={{...thStyle, position: 'sticky', top: 0}}></th>
                    <th style={{...thStyle, position: 'sticky', top: 0}}></th>
                    <th style={{...thStyle, position: 'sticky', top: 0}}></th>
                    <th style={{...thStyle, position: 'sticky', top: 0}}></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{...tdStyle, position: 'sticky', left: 0}}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                </tr>
            </tbody>
        </table>
    )
}

export default MyTable;
