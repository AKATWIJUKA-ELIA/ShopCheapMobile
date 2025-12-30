import CartHeader from '@/components/Cart/CartHeader';
import HomeHeader from '@/components/Header';
import { useCartStore } from '@/components/Operations';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

export default function TabLayout() {
  const { items } = useCartStore();
  const distinctCount = items.length;
  const {colors} = useTheme();
  // const styles = useMemo(() => appStyles(colors), [colors]);

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.grayish,
      tabBarStyle: { backgroundColor: colors.background, paddingTop:5, height:60 },
      headerShown:false,
      tabBarLabelStyle:{fontSize:11, fontWeight:'700'},
    }}>
      <Tabs.Screen name='home' options={{
        title:'Home', 
        headerShown:true,
        header: () => <HomeHeader />,
        tabBarLabelStyle:{fontSize:12},
        tabBarIcon:({ color, size }) => <Ionicons name='home' size={size} color={color}/>,
        // headerLeft:() => (
        //   <Image source={{uri:'https://shopcheap.vercel.app/_next/image?url=%2Fimages%2Flogo2.png&w=1080&q=75'}}
        //   style={{ 
        //     width: 100, 
        //     height: 50,
        //     padding:5,
        //     borderRadius:8,
        //     marginBottom:10,
        //     marginTop:-10,
        //   }}  
        //   resizeMode='contain'
        //   />
        // ),
        // headerRight:() => (
        //   <View style={{width:Platform.OS === 'android'? '100%' :'100%', marginRight:10, marginBottom:10}}>
        //     <SearchBar placeholder='Search products' />
        //   </View>
        // ),
        // headerTitle: ''
      }}/>

      <Tabs.Screen name='categories' options={{
        title:'Categories',
        headerShown:true,
        header: () => <HomeHeader />,
        tabBarIcon:({ color, size }) => <Ionicons name='grid' size={size} color={color}/>
      }}/>

      <Tabs.Screen name='cart' options={{
        title:'Cart',
        headerShown:true,
        header: () => <CartHeader/>,
        tabBarBadge: undefined,
        tabBarIcon:({ color, size }) => (
          <View>
            <Ionicons name='cart' size={size} color={color}/>
            {distinctCount > 0 ? (
              <View style={{position:'absolute', right:-8, top:-4, backgroundColor:colors.primary, borderRadius:10, paddingHorizontal:6, paddingVertical:1}}>
                <Text style={{color:'#000', fontSize:10, fontWeight:'800'}}>{distinctCount > 99 ? '99+' : distinctCount}</Text>
              </View>
            ) : null}
          </View>
        ),
        // headerRight:() => (
        //   <View style={{marginRight:10, flexDirection:'row'}}>
        //     <TouchableOpacity style={{
        //         backgroundColor:Colors.primary,
        //         borderRadius:14,
        //         padding:5
        //       }}
        //     >
        //       <Text style={{color:Colors.dark}}>
        //         My orders
        //       </Text>
        //     </TouchableOpacity>
              
        //   </View>
        // ),
      }}/>

      <Tabs.Screen name='shops' options={{
        title:'Shops',
        tabBarIcon:({ color, size }) => <Entypo name='shop' size={size} color={color}/>
      }}/>

      <Tabs.Screen name='account' options={{
        title:'Account',
        tabBarIcon:({ color, size }) => <Ionicons name='person' size={size} color={color}/>
      }}/>
    </Tabs>
  );
}



