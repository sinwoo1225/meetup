import React from 'react'
import styled from 'styled-components';
import Confference from './Conferrece'

function RoomPage(props) {
    return (
        <Layout>
            <Confference {...props}/>
       </Layout>
    )
}

const Layout = styled.div`
    background-color:#fafafa;
    position:relative;
`;

export default RoomPage;
