/*

Copyright 2024-2025 HCL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

// << FOR RESPONSIVE WEB The meta tag has to be somewhere css or here or I dont knwo where
// <meta name="viewport" content="initial-scale=1, width=device-width" /> 


import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PersistentDrawerLeft from './PersistentDrawerLeft.js';
import ProcessAndBlastSession from './ProcessAndBlastSession.js';

const App = () => {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<PersistentDrawerLeft />} />
                <Route path="/uploadSession" element={<ProcessAndBlastSession />} />
            </Routes>
        </div>
    );
}
export default App;