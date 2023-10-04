<template>
    <component :is="component" :data="data" v-if="component" />
</template>

<script>
export default {
    name: 'extension-async-component',
    props: ['data', 'target', 'name', 'base','type'],
    data() {
        return {
            component: null,
        }
    },
    mounted() {
        this.reloadComponent();
    },
    watch :{
        target : function(){
            this.reloadComponent();
        }
    },
    methods : {
        reloadComponent : function(){
            if(this.target){
                if(this.base){
                    console.log('loading async component : ' + `~/extensions/${this.base}/${this.target}`);
                    this.component = () => { return import(`~/extensions/${this.base}/${this.target}`); };
                }else{
                    console.log('loading async component : ' + `~/extensions/${this.target}`);
                    this.component = () => { return import(`~/extensions/${this.target}`); };                    
                }
            }else{
                console.log('async component no target');
            }
        }
    }
}
</script>