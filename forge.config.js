// module.exports = {
//     publishers: [
//         {
//             "packagerConfig": {},
//             "publishers": [
//                 {
//                     "name": "@electron-forge/publisher-github",
//                     "config": {
//                         "repository": {
//                             "owner": "outsider987",
//                             "name": "GF_playwright"
//                         },
//                         "prerelease": false,
//                         "draft": true
//                     }
//                 }
//             ]
//         },
//     ],
// }

module.exports = {
    //...
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                certificateFile: './cert.pfx',
                certificatePassword: process.env.CERTIFICATE_PASSWORD,
            },
        },
    ],
    //...
}