var datadesc = {
    pm2_5: {
        txt_title: 'pm2_5',
        txt_desc: 'pm2_5_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '5': {
                txt: '< 5',
                col: '#2AAD27'
            },
            '25': {
                txt: '< 25',
                col: '#FFD326'
            },
            '50': {
                txt: '< 50',
                col: '#CB2B3E'
            }
        }
    },
    pm10_0: {
        txt_title: 'pm10_0',
        txt_desc: 'pm10_0_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '15': {
                txt: '< 15',
                col: '#2AAD27'
            },
            '45': {
                txt: '< 45',
                col: '#FFD326'
            },
            '90': {
                txt: '< 90',
                col: '#CB2B3E'
            }
        }
    },
    Ratio: {
        txt_title: 'ratio',
        txt_desc: 'ratio_desc',
        txt_uknw: 'unknown',
        col: '#7B7B7B',
        calcmode: '<',
        values: {
            '0.5': {
                txt: 'ratio_coarse',
                col: '#4C78A8'
            },
            '0.7': {
                txt: 'ratio_mixed',
                col: '#9A9A9A'
            },
            '1.01': {
                txt: 'ratio_fine',
                col: '#E45756'
            },
            '999': {
                txt: 'ratio_inconsistent',
                col: '#7B7B7B'
            }
        }
    }
};
