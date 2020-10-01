import React, { useState, useEffect } from 'react';
import { Button, Accordion, AccordionSummary, AccordionDetails, Divider, Menu, MenuItem, IconButton, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GetApp, ExpandMoreRounded } from '@material-ui/icons';
import { navigate } from '@reach/router';
import { useSelector, useDispatch } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from "react-csv";

import colors from '../config/colors';
import MyPaper from '../components/MyPaper';
import MyTable from '../components/MyTable';
import MyButton from '../components/MyButton';
import MyHeader from '../components/MyHeader';
import MyAccordion from '../components/MyAccordion';

const useStyles = makeStyles((theme) => ({
    loading: {
        display: 'flex',
        margin: 'auto',
        justifyContent: 'center',
        alignContent: 'center',
        height: '100vh',
        paddingTop: '200px'
    },
    circle: {
        color: colors.backgroundButton,
        // backgroundColor: colors.backgroundButton
    },
    root: {
        flexGrow: 1,
        margin: 'auto',
        backgroundColor: colors.backgroundSite,
        minHeight: '100vh',
        alignContent: 'center',
        justifyContent: 'center'
    },
    content: {
        width: '92%',
        margin: 'auto',
        padding: '30px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
    },
    headerText: {
        width: '60%'
    },
    buttons: {
        display: 'inline-flex',
        width: '40%',
        justifyContent: 'space-between'
    },
    title: {
        textAlign: 'left',
        fontSize: 22,
        fontWeight: 'bolder',
    },
    desc: {
        textAlign: 'left',
    },
    resultDiv: {
        marginBottom: '25px'
    },
    resultHeader: {
        backgroundColor: colors.borderTable,
        color: colors.textNormal,
        fontWeight: 'bold',
        fontSize: 16,
        padding: '10px'
    },
    resultBody: {
        maxHeight: '30rem',
        overflow: 'auto',
        padding: '8px 10px',
        backgroundColor: colors.backgroundTable
    },
    divider: {
        height: 10,
        borderBottomColor: colors.borderTable,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        opacity: '0.5',
        marginBottom: '8px'
    },

    card: {
        width: '80%',
        alignSelf: 'center',
        backgroundColor: colors.backgroundTable,
        padding: 15
    },
    alignRight: {
        justifyContent: 'flex-end',
    },
    alignLeft: {
        justifyContent: 'flex-start',
    },
    alignCenter: {
        justifyContent: 'center',
        textAlign: 'center'
    },
    alignBetween: {
        justifyContent: 'space-between'
    },
    button: {
        color: colors.textLabel,
        backgroundColor: colors.backgroundButton
    },
    backButton: {
        color: colors.textLabel,
        backgroundColor: colors.backgroundButton
    },
    error: {
        color: colors.textError,
        marginBottom: 30
    },
    paper: {
        width: '80%',
        alignContent: 'center',
        backgroundColor: colors.backgroundSite,
    },
    container: {
        maxHeight: 440,
        marginTop: 20
    },
    cell: {
        color: colors.darkNeutral100,
        borderBottom: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.darkNeutral40,
    },
    overflow: {
        overflow: 'auto'
    },
    summary: {
        backgroundColor: colors.backgroundAccordion,
        color: colors.textLabel
    }
}));

const Results = props => {
    const classes = useStyles();
    const cats = useSelector(state => state.catDef);
    const request = useSelector(state => state.request);
    const finalResult = useSelector(state => state.queryResult);
    const reqBody = !request ? '' : request['reqBody'];
    const reqType = !request ? '' : request['reqType'];
    const dispatch = useDispatch();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    // const [finalResult, setFinalResult] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [pdfData, setPdfData] = useState({});
    const [catCsv, setCatCsv] = useState([]);
    // const {reqBody, cats, reqType} = props.location.state;

    console.log(reqBody['ref_ids'])
    useEffect(() => {

        fetch('/getresults', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(reqBody)}).then(r => r.json()).then(res => {
            let queryResult = {};
            if (res['result_status'] === 'Failure') {
                console.log(res);
                setError(true);
                setLoading(false);
                return;
            } else {
                queryResult = {'message': 'all results', 'data': res['results_data'], 'output': res['output_data']};
            };
            
            let outputData = queryResult['output']['results'];
            let data = queryResult['data']['results'];
            let pdfDataRes = queryResult['output']['results'];
            let refs = queryResult['data']['ref_id'];
            let catList = queryResult['data']['cat_id'];

            // convert datetime into JS
            // finalResult['output']['results'][idx]['data']
            for (let i=0; i<data.length; i++) {
                if (data[i] === '') continue;
                for (let j=0; j<data[i]['data'].length; j++) {
                    let dateStr = new Date(+data[i]['data'][j][data[i]['data'][j].length-1]);
                    data[i]['data'][j][data[i]['data'][j].length-1] = dateStr.toLocaleDateString();
                    outputData[i]['data'][j][outputData[i]['data'][j].length-1] = dateStr.toLocaleDateString();
                };
            };
            
            console.log(queryResult);

            // prepare data for csv conversion
            let columns = [];
            let pdfPrep = {};
            
            for (let i=0; i<catList.length; i++) {
                if (data[i] !== '' && !columns.length) {
                    if (reqType === 'Select') {
                        columns = ['Reference Designator'].concat(data[i]['columns']);
                    } else {
                        columns = data[i]['columns'];
                    };
                    pdfPrep['head'] = [pdfDataRes[i]['columns']];
                    break;
                };
            };

            if (!columns.length) {             
                // setFinalResult(queryResult);
                dispatch({
                    type: 'RESULT',
                    queryResult: queryResult
                });
                setLoading(false);
                return;
            };

            let rows = [columns];
            for (let i=0; i<catList.length; i++) {
                if (data[i] === '') continue;                
                if (data[i]['data'].length) {
                    for (let j=0; j<data[i]['data'].length; j++) {
                        if (reqType === 'Select') data[i]['data'][j].unshift(refs[i]);
                        rows.push(data[i]['data'][j]);
                    };
                };
            };
            // console.log(rows);
            setCsvData(rows);

            // prepare data for pdf conversion
            let pdfRows = [];
            let pdfText = [];
            for (let i=0; i<catList.length; i++) {
                if (pdfDataRes[i] === '') continue;
                pdfRows.push([]);
                if (pdfDataRes[i]['data'].length) {
                    for (let j=0; j<pdfDataRes[i]['data'].length; j++) {
                        pdfRows[pdfRows.length-1].push(pdfDataRes[i]['data'][j]);
                    };
                };
                pdfText.push('Results for ' + (reqType === 'Select' ? refs[i] : 'Category ' + catList[i]));
            };
            pdfPrep['body'] = pdfRows;
            pdfPrep['text'] = pdfText;
            setPdfData(pdfPrep);

            // cat def csv
            let catDef = cats['allCats'];
            let catRows = [[...cats['colList']]];
            for (let i=0; i<catDef.length; i++) {
                let tempRow = [...catDef[i]];
                catRows.push(tempRow);
            };
            console.log(catRows);
            setCatCsv(catRows);

            // setFinalResult(queryResult);
            dispatch({
                type: 'RESULT',
                queryResult: queryResult
            });
            setLoading(false);
        })
        .catch(error => {
            console.log(error);
        });        
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handlePDF = () => {
        handleClose();
        let doc = new jsPDF('l');
        let finalY = doc.lastAutoTable.finalY || 10;
        let len = pdfData['text'].length;

        for (let i=0; i<len; i++) {
            doc.text(pdfData['text'][i], 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: pdfData['head'],
                body: pdfData['body'][i],
                pageBreak: 'avoid'
            });    
            finalY = doc.lastAutoTable.finalY;        
        };
        doc.save('result.pdf');
    };

    const handleBack = () => {
        // dispatch({
        //     type: 'RESET',
        //     queryResult: null,
        //     request: null
        // });
        navigate('/', {replace: true});
    };

    return (
        loading===true ? <div className={classes.loading}><CircularProgress size={65} thickness={5} className={classes.circle}/></div> :
        <>      
        <div className={classes.root}>
            <MyHeader title={'TVS-Diode Tool'} />
            <div className={classes.content}>
                <div className={classes.header}>
                    <div className={classes.headerText}>
                        <p className={classes.title}>{reqType === 'Select' ? 'Selection' : 'Evaluation'}</p>
                        <p className={classes.desc}>{reqType === 'Select' ? <>Reference Designator: <span style={{fontWeight: 'bold'}}>{reqBody['ref_ids'][0]}</span></> : reqBody.categories.length > 1 ? 'All Categories' : `2nd Source Category: ${reqBody.categories[0]}`}</p>
                    </div>
                    <div className={classes.buttons}>
                        <MyButton value='start over' bgColor={colors.backgroundSite} fontColor={colors.backgroundButton} borderColor={colors.backgroundButton} handleSubmit={handleBack} />
                        <MyButton value='download' bgColor={colors.backgroundButton} fontColor={colors.textLabel} borderColor={colors.backgroundButton} handleSubmit={handleClick} useIcon={true} />
                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem onClick={handlePDF} disabled={Object.keys(pdfData).length === 0}>Download result in PDF</MenuItem>
                            <MenuItem disabled={csvData.length === 0}><CSVLink data={csvData} filename={"result.csv"} onClick={handleClose}>Download full data in CSV</CSVLink></MenuItem>
                            <MenuItem disabled={catCsv.length === 0}><CSVLink data={catCsv} filename={"catdef.csv"} onClick={handleClose}>Download category definitions in CSV</CSVLink></MenuItem>
                        </Menu>
                    </div>
                </div>
                {/* <div className={classes.alignBetween}>
                    <Button size="small" className={classes.backButton} onClick={handleBack}>Reset</Button>
                    <IconButton className={classes.button} onClick={handleClick}><GetApp /></IconButton>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handlePDF} disabled={Object.keys(pdfData).length === 0}>Download result in PDF</MenuItem>
                        <MenuItem disabled={csvData.length === 0}><CSVLink data={csvData} filename={"result.csv"} onClick={handleClose}>Download full data in CSV</CSVLink></MenuItem>
                        <MenuItem disabled={catCsv.length === 0}><CSVLink data={catCsv} filename={"catdef.csv"} onClick={handleClose}>Download category definitions in CSV</CSVLink></MenuItem>
                    </Menu>
                </div> */}
                {/* <h2 className={classes.title}>{reqType === 'Evaluate' ? 'Evaluation ' : 'Selection '} Result</h2> */}
                {/* <p className={classes.error}>
                    {
                        inputError !== '' ? errors[inputError] : ''
                    }
                </p> */}
                {
                    finalResult['data']['cat_id'].map((cat, idx) => (
                        <div key={idx} className={classes.resultDiv}>
                            <div className={classes.resultHeader}>
                                {`Category ${cat}`}
                            </div>
                            <div className={classes.resultBody}>
                                {/* <Accordion>
                                    <AccordionSummary className={classes.summary} expandIcon={<ExpandMoreRounded style={{fill: colors.textLabel}}/>}>
                                        Category {cat}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className={classes.overflow}>
                                        <MyTable columns={cats['colList']} data={[cats['allCats'][parseInt(cat)-1]]} fixedCol={3} tdStyle={{color: colors.neutral80}} thStyle={{minWidth: 50, backgroundColor: colors.backgroundDark}} />
                                        </div>
                                    </AccordionDetails>
                                </Accordion> */}
                                <MyAccordion>
                                    <MyTable columns={cats['colList']} data={[cats['allCats'][parseInt(cat)-1]]} fixedCol={0} tdStyle={{color: colors.neutral80, fontSize: 12, textAlign: 'center'}} thStyle={{minWidth: 100, backgroundColor: colors.backgroundDark, fontSize: 12, verticalAlign: 'bottom'}} />
                                </MyAccordion>
                                <div className={classes.divider} /> 
                                {
                                    finalResult['output']['results'][idx] === '' ? <p className={classes.subtext}>No component found</p> : <div className={classes.overflow}><MyTable columns={finalResult['output']['results'][idx]['columns']} data={finalResult['output']['results'][idx]['data']} fixedCol={0} tdStyle={{color: colors.neutral80, fontSize: 14, textAlign: 'center'}} thStyle={{minWidth: 100, fontSize: 14}} trStyle={{height: 25}} /></div>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        </>
        
    )
}

export default Results;