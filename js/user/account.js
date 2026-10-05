var edit_userdata_options = {
    showWhenNoData: true,
    allowedToAddNew: false,
    definitions: new Map()
};
edit_userdata_options.definitions.set("/SmartUser/smartuser/user", [
    {
        name: 'username',
        type: 'string',
        required: true
    },{
        name: 'firstname',
        type: 'string'
    },
    {
        name: 'lastname',
        type: 'string'
    },
    {
        name: 'email',
        type: 'email'
    },
    {
        name: 'street',
        type: 'string'
    },
    {
        name: 'houseno',
        type: 'string'
    },
    {
        name: 'zipcode',
        type: 'string'
    },
    {
        name: 'city',
        type: 'string'
    },
    {
        name: 'country',
        type: 'string'
    }
]);