import pymysql
import pandas as pd
import numpy as np
from datetime import datetime
from mysqlconnection import user, password, db

def loadCatDef():
    try:
        conn = pymysql.connect(host = 'localhost', user = user, password = password, db = db, charset = 'utf8mb4')
        cat_def = pd.read_sql_query("select * from cat_def;", conn)
        del components['id']
        cat_def = cat_def.fillna('')
        col_name_ref = pd.read_sql_query("select * from col_ref", conn)
        cat_def = cat_def.rename(columns=dict(zip(col_name_ref['col_name'], col_name_ref['final_name'])))
        return {'result_status': 'Success', 'data': cat_def.to_dict(orient='split')}
    except Exception as e:
        print(e)
        return {'result_status': 'Failure', 'message': 'Error occurred while querying Cat Def'}
    finally:
        conn.close()

def pfTest(test_type, cat_def, components):
    pf_test_cols = test_type.loc[test_type['test_type'] == 'P/F','param_name'].tolist()
    pf_test_cols.insert(0,'mpn')

    pf_test = pd.DataFrame(columns=pf_test_cols)
    pf_test['mpn'] = components.loc[:,'mpn'].copy()

    if 'package_size' in pf_test:
        pf_test['package_size'] = components['package_size'] == cat_def.loc[0,'package_size']
    if 'polarity' in pf_test:
        pf_test['polarity'] = components['polarity'] == cat_def.loc[0,'polarity']
    if 'v_esd_air' in pf_test:
        pf_test['v_esd_air'] = components['v_esd_air'] >= cat_def.loc[0,'v_esd_air']
    if 'v_esd_contact' in pf_test:
        pf_test['v_esd_contact'] = components['v_esd_contact'] >= cat_def.loc[0,'v_esd_contact']
    if 'v_br_v_trig_min' in pf_test:
        pf_test['v_br_v_trig_min'] = components['v_br_v_trig_min'] >= cat_def.loc[0,'v_br_v_trig_min']
    if 'i_holding_min' in pf_test:
        i_holding_test = (components['design_topology'] == 'SCR') | (components['design_topology'] == 'Deep Snapback') | ((pd.notnull(components['v_holding_min'])) & (components['v_holding_min'] < components['v_rwm_max'])) | (components[['tlp_clamp_voltage_4a_reverse','tlp_clamp_voltage_8a_reverse','tlp_clamp_voltage_16a_reverse','tlp_clamp_voltage_30a_reverse']].min(axis=1) < components['v_rwm_max'])
        i_holding_final = components['i_holding_min'] >= cat_def.loc[0,'i_holding_min']
        pf_test.loc[i_holding_test == True, 'i_holding_min'] = i_holding_final
        pf_test.loc[i_holding_test == False, 'i_holding_min'] = 'N/A'
    if 'c_j_max' in pf_test:
        pf_test['c_j_max'] = components['c_j_max'] <= cat_def.loc[0,'c_j_max']
    if 'c_j_delta_max' in pf_test:
        cj_delta_notnull = pd.notnull(components['c_j_delta_max'])
        cj_delta_test = components['c_j_delta_max'] <= int(cat_def.loc[0,'c_j_delta_max'])
        pf_test.loc[cj_delta_notnull == True, 'c_j_delta_max'] = cj_delta_test
        pf_test.loc[cj_delta_notnull == False, 'c_j_delta_max'] = 'No Data'
    if 'l_io_max' in pf_test:
        l_io_max_notnull = pd.notnull(components['l_io_max'])
        pf_test.loc[l_io_max_notnull == True, 'l_io_max'] = components['l_io_max'] <= cat_def.loc[0,'l_io_max']
        pf_test.loc[l_io_max_notnull == False, 'l_io_max'] = 'No Data'    
    if 'i_leakage_max' in pf_test:
        pf_test['i_leakage_max'] = components['i_leakage_max'] <= cat_def.loc[0,'i_leakage_max']    
    pf_test['status'] = pf_test[list(pf_test.columns)].apply(lambda x: 'Fail' if sum(x == False) > 0 else 'Pass', axis=1)
    return pf_test

def scoreTest(test_type, cat_def, components, score_ref, pf_test):
    score_test_cols = test_type.loc[test_type['test_type'] == 'Score','param_name'].tolist()
    score_test_cols.insert(0,'mpn')
    score_test_cols.append('status')
    score_test_cols.append('score')

    score_test = pd.DataFrame(columns=score_test_cols)
    score_test['mpn'] = components.loc[:,'mpn'].copy()
    score_test['status'] = pf_test.loc[:,'status'].copy()

    min = 10000
    max = -10000
    vbr_max = components['v_br_v_trig_max'].copy()
    vbr_min = components['v_br_v_trig_min'].copy()
    for i, v in vbr_max.items():
        if score_test.loc[i,'status'] == 'Fail':
            score_test.loc[i,'v_br_v_trig_max'] = np.NaN
        elif pd.isnull(v) & pd.isnull(vbr_min[i]):
            score_test.loc[i,'status'] = 'Fail'
            score_test.loc[i,'v_br_v_trig_max'] = np.NaN
        elif pd.notnull(v):
            score_test.loc[i,'v_br_v_trig_max'] = vbr_max[i]
        else:
            score_test.loc[i,'v_br_v_trig_max'] = vbr_min[i] * 2

    max_cols = ['mhz_824_890_2nd_harmonics_20dbm_level','mhz_824_890_3rd_harmonics_20dbm_level','ghz_24_2484_2nd_harmonics_20dbm_level','ghz_24_2484_3rd_harmonics_20dbm_level','ghz_5_5825_2nd_harmonics_20dbm_level','ghz_5_5825_3rd_harmonics_20dbm_level']
    for column in score_test:
        if (column == 'mpn') | (column == 'status') | (column == 'score'):
            continue
        else:
            col_status = score_test['status'].copy()
            col_null = pd.notnull(components[column])
            col_component = components[column].copy()
            if column != 'v_br_v_trig_max':           
                col_component.loc[col_status == 'Fail'] = np.NaN
                score_test.loc[col_null == True, column] = col_component
                score_test.loc[col_null == False, column] = np.NaN
                score_test[column] = col_component.copy()
            min = score_test[column].min()
            max = score_test[column].max()
            max_score = test_type.loc[test_type['param_name'] == column,'max_score'].values[0]
            col_ref_num = test_type.loc[test_type['param_name'] == column,'score_ref_col'].values[0]
            col_ref = score_ref['ratio'+str(col_ref_num)].copy()
            diff = score_ref['difference'].tolist()
            if column in max_cols:
                calc_col = ((score_test[column] - max) * -1) / max
            else:
                calc_col = (score_test[column] - min) / min

            for i, v in calc_col.items():
                if pd.isnull(v):
                    continue
                else:
                    score_row = pd.Index(diff).get_loc(v, method='pad')
                    score_test.loc[i,column] =  max_score * col_ref[score_row]
    score_test['score'] = score_test.apply(lambda x: pd.to_numeric(x, errors='coerce')).sum(axis=1)
    score_test['rank'] = score_test.score[score_test['score']>0].rank(ascending=False, method='dense')
    return score_test

def calculate(input):
    try:
        conn = pymysql.connect(host = 'localhost', user = user, password = password, db = db, charset = 'utf8mb4')
        results = {'ref_id': [], 'cat_id': [], 'results': []} 
        output_results = {'ref_id': [], 'cat_id': [], 'results': []} 
        for i in input['ref_ids']:
            results['ref_id'].append(i)
            output_results['ref_id'].append(i)
            
        for cat_id in input['categories']:
            print(cat_id)
            results['cat_id'].append(cat_id)
            output_results['cat_id'].append(cat_id)

            components = pd.read_sql_query("select * from components where category=%(cat_id)s;", conn, params={'cat_id': cat_id})
            cat_def = pd.read_sql_query("select * from cat_def where category=%(cat_id)s;", conn, params={'cat_id': cat_id})
            test_type = pd.read_sql_query("select * from test_type where cat_id=%(cat_id)s;", conn, params={'cat_id': cat_id})
            score_ref = pd.read_sql_query("select * from score_ref order by difference;", conn)
            col_name_ref = pd.read_sql_query("select * from col_ref", conn)

            if components.shape[0] == 0:
                # components = components.rename(columns=dict(zip(col_name_ref['col_name'], col_name_ref['final_name'])))
                # del components['id']
                # newCol = pd.DataFrame(columns=list(components.columns))
                # newOutput = pd.DataFrame(columns=['Manufacturer','MPN','Status','Rank','Package Size','V Breakdown Max','Dynamic Resistance (Forward)','Junction Capacitance','Leakage Current','Evaluated'])
                # results['results'].append(newCol.to_dict(orient='split'))
                # output_results['results'].append(newOutput.to_dict(orient='split'))
                results['results'].append('')
                output_results['results'].append('')
                continue
            elif components.shape[0] == 1:
                pf_test = pfTest(test_type, cat_def, components)
                components['status'] = pf_test.loc[:,'status'].copy()
                components = components.rename(columns=dict(zip(col_name_ref['col_name'], col_name_ref['final_name'])))
                del components['id']
                components = components.fillna('')
                components['Score'] = ''
                components['Rank'] = ''
                components['Evaluated'] = int(datetime.now().strftime('%s%f'))/1000
                output = components[['Manufacturer','MPN','Status','Rank','Package Size','V Breakdown Max','Dynamic Resistance (Forward)','Junction Capacitance','Leakage Current','Evaluated']].copy()
                results['results'].append(components.to_dict(orient='split'))
                output_results['results'].append(output.to_dict(orient='split'))
                continue

            pf_test = pfTest(test_type, cat_def, components)
            score_test = scoreTest(test_type, cat_def, components, score_ref, pf_test)

            components['status'] = score_test['status'].copy()
            components['score'] = score_test['score'].copy()
            components['rank'] = score_test['rank'].copy()

            sorted_components = components.sort_values('rank')
            sorted_components = sorted_components.fillna('')
            sorted_components = sorted_components.rename(columns=dict(zip(col_name_ref['col_name'], col_name_ref['final_name'])))
            del sorted_components['id']
            sorted_components['Evaluated'] = int(datetime.now().strftime('%s%f'))/1000

            output = sorted_components[['Manufacturer','MPN','Status','Rank','Package Size','V Breakdown Max','Dynamic Resistance (Forward)','Junction Capacitance','Leakage Current','Evaluated']].copy()

            results['results'].append(sorted_components.to_dict(orient='split'))
            output_results['results'].append(output.to_dict(orient='split'))
            
        return {'result_status': 'Success', 'results_data': results, 'output_data': output_results}
    except Exception as e:
        print(e)
        return {'result_status': 'Failure', 'message': 'Error occurred while runnig calculations'}
    finally:
        conn.close()