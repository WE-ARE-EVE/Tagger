<script>
import axios from 'axios'
import codeHighlight from './components/codeHighlight.vue'

export default {
    name: 'App',
    components: {
        codeHighlight
    },
    data() {
        return {
            nameInput: '',
            validNames: ["guy", "neta", "noga"],
            currStep: 'login',
            selectedFile: '',
            filesToTag: [],
            fileContent: '',
            timeComplexity: '',
            spaceComplexity: '',
            taggedFiles: [],
            displayLimit: 100,
            openModal: false,
        }
    },
    methods: {
        validateName() {
            if (this.nameInput === '') {
                alert('Please enter your name')
                return
            }

            if (this.validNames.includes(this.nameInput.toLowerCase())) {
                this.currStep = 'fileSelect'
            } else {
                alert('Sorry, you are not allowed here')
                this.nameInput = ''
            }
        },
        async getFilesToTag() {
            await axios.get('https://taggerapiproxyserver.azurewebsites.net/api/v1/getFilesToTag')
                .then((res) => {
                    this.filesToTag = res.data
                    this.currStep = 'selectingFile'
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        async tagFile(filename, data) {
            await axios.post('https://taggerapiproxyserver.azurewebsites.net/api/v1/tagFile', {
                data
            })
                .then((res) => {
                    console.log(res)
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        async selectFile(file) {
            this.currStep = 'tagFile'
            this.selectedFile = file
            await axios.get('https://taggerapiproxyserver.azurewebsites.net/api/v1/getFileContent', {
                params: {
                    filename: file
                }
            })
                .then((res) => {
                    this.fileContent = res.data['file_content']
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        submitTags() {
            if (!this.timeComplexity || !this.spaceComplexity) {
                alert('Please fill in both time and space complexity')
                return
            }
            let problem_id = this.selectedFile.split('/')[0]
            let submission_id = this.selectedFile.split('/')[1]
            this.tagFile(this.selectedFile, {
                "file_id": this.selectedFile,
                "problem_id": problem_id,
                "submission_id": submission_id,
                "time_complexity": this.timeComplexity,
                "space_complexity": this.spaceComplexity
            })
            this.reset()
        },
        reset() {
            this.getFilesToTag()
            this.selectedFile = ''
            this.fileContent = ''
            this.timeComplexity = ''
            this.spaceComplexity = ''
            this.currStep = 'fileSelect'
        },
        async getTaggedFiles() {
            this.openModal = true;
            await axios.get('https://taggerapiproxyserver.azurewebsites.net/api/v1/getTaggedFiles')
                .then((res) => {
                    this.taggedFiles = res.data['files']
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        openInNewTab(url) {
            window.open(url, '_blank');
        }
    },
    mounted() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currStep === 'login') {
                this.validateName()
            }
        })
    },
    computed: {
        displayTaggedFiles() {
            return this.taggedFiles.slice(0, this.displayLimit)
        }
    }
}
</script>

<template>
    <div class="app">
        <div class="tagged_modal" v-if="openModal">
            <div class="tagged_modal__close" @click="openModal = false">X</div>
            <div class="tagged_modal__title">
                Tagged Files - {{ this.taggedFiles.length }}
            </div>
            <div class="tagged_modal__loading" v-if="!this.taggedFiles">fetching files</div>
            <div class="tagged_modal__files" v-if="this.taggedFiles">
                <div class="tagged_modal__files__file" v-for="file in this.displayTaggedFiles" :key="file">
                    <div class="tagged_modal__files__file__item">{{ file['problem_id']}}</div>
                    <div class="tagged_modal__files__file__item">{{ file['submission_id']}}</div>
                    <div class="tagged_modal__files__file__item">{{ file['time_complexity']}}</div>
                    <div class="tagged_modal__files__file__item">{{ file['space_complexity']}}</div>
                </div>
            </div>
            <div class="tagged_modal__show_more" @click="this.displayLimit += 100">
                show more
            </div>
        </div>
        <div class="backdrop" v-if="openModal"></div>
        <div class="navbar">
            <div class="navbar__item" @click="reset()">whatsourname?</div>
            <div class="navbar__item">defuq</div>
            <div class="navbar__item" @click="getTaggedFiles()">tagged</div>
        </div>
        <div class="main">
            <div class="main__interactive">
                <div class="main__interactive__login" v-if="currStep==='login'">
                    <div class="main__interactive__start_button">
                        <div class="main__interactive__start_button__text" @click="validateName">Start</div>
                    </div>
                    <input class="main__interactive__name" placeholder="Your Name" v-model="nameInput">
                </div>
                <div class="main__interactive__file_select" v-if="currStep==='fileSelect'">
                    <div class="main__interactive__file_select__title" @click="getFilesToTag()">
                        <div class="main__interactive__file_select__title__main">CLAIM FILE</div>
                        <div class="main__interactive__file_select__title__sub">Once you claim you must finish!</div>
                    </div>
                </div>
                <div class="main__interactive__file_select" v-if="currStep==='selectingFile'">
                    <div class="main__interactive__file_select__files">
                        <div class="main__interactive__file_select__files__file" v-for="file in filesToTag['files']" :key="file" @click="selectFile(file)">
                            <div class="main__interactive__file_select__files__file__name">
                                {{ file }}
                            </div>
                            <div class="main__interactive__file_select__files__file__claim">
                                CLAIM
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="file_explorer" v-if="currStep==='tagFile'">
            <div class="file_explorer__left">
                <div class="file_explorer__left__complexity">
                    <div class="file_explorer__left__complexity__title">Time Complexity</div>
                    <input type="text" class="file_explorer__left__complexity__input" placeholder="Must be in O(input) format!" v-model="timeComplexity">
                </div>
                <div class="file_explorer__left__complexity">
                    <div class="file_explorer__left__complexity__title">Space Complexity</div>
                    <input type="text" class="file_explorer__left__complexity__input" placeholder="Must be in O(input) format!" v-model="spaceComplexity">
                </div>
                <div class="file_explorer__left__done">
                    <div class="file_explorer__left__done__text" @click="submitTags">Done</div>
                </div>
            </div>
            <div class="file_explorer__right">
                <div class="file_explorer__right__title">
                    {{ selectedFile }}
                </div>
                <div class="file_explorer__right__content">
                    <code-highlight :code="fileContent" language="python"></code-highlight>
                </div>
                <div class="file_explorer__right__helpers">
                    <div class="file_explorer__right__helpers__helper" @click="openInNewTab('https://chat.openai.com/')">
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1_167)">
                                <path d="M0.0216064 12.5009C0.0216064 5.6086 5.60847 0.0217285 12.5007 0.0217285H39.4971C46.3915 0.0217285 51.9784 5.6086 51.9784 12.5009V52.0001H12.5007C5.60847 52.0001 0.0216064 46.4132 0.0216064 39.521V12.5009Z" fill="#74AA9C"/>
                                <path
                                    d="M23.9317 6.46446C19.6524 6.46446 15.8507 9.21575 14.5259 13.2789C11.7746 13.8452 9.39934 15.5655 8.00748 18.0034C5.86135 21.7079 6.35195 26.3654 9.22644 29.5403C8.33816 32.2008 8.64289 35.1098 10.0607 37.5197C12.1938 41.237 16.4861 43.1433 20.6855 42.2571C22.5463 44.3536 25.2198 45.5488 28.0251 45.5379C32.3044 45.5379 36.1061 42.7867 37.4331 38.7235C40.1887 38.1551 42.5596 36.4347 43.9385 34.0011C46.0976 30.2967 45.607 25.6392 42.7325 22.4621V22.4492C43.6208 19.7886 43.316 16.8774 41.8983 14.4568C39.7651 10.7524 35.4728 8.84617 31.2865 9.73229C29.4148 7.64019 26.737 6.45149 23.9317 6.46446ZM23.9317 9.00395L23.9187 9.01691C25.6412 9.01691 27.2968 9.61126 28.6216 10.7113C28.5676 10.7373 28.4617 10.8043 28.3839 10.8432L20.5925 15.33C20.1948 15.5547 19.9571 15.9783 19.9571 16.4409V26.9727L16.605 25.0405V16.335C16.6028 12.2912 19.8815 9.01043 23.9317 9.00395ZM33.3159 12.0708C35.944 12.0665 38.3732 13.4648 39.6851 15.7406C40.5323 17.2232 40.85 18.9566 40.5583 20.6359C40.5042 20.597 40.4005 20.5429 40.3335 20.504L32.5443 16.0043C32.1466 15.7795 31.6582 15.7795 31.2605 16.0043L22.1313 21.2713V17.4069L29.6677 13.0542C30.7764 12.4123 32.0342 12.0729 33.3159 12.0708ZM14.0482 16.0691V25.3172C14.0482 25.7797 14.286 26.1903 14.6836 26.4281L23.7977 31.6799L20.4326 33.6251L12.9071 29.2852C9.40582 27.258 8.20848 22.782 10.2314 19.2829C11.0894 17.8003 12.4381 16.6635 14.0482 16.0691ZM31.5091 18.3601L39.0475 22.6999C42.5596 24.725 43.7505 29.1966 41.7232 32.7022L41.7362 32.7152C40.876 34.1978 39.523 35.3346 37.9215 35.9182V26.668C37.9215 26.2054 37.6838 25.7818 37.2861 25.5571L28.1591 20.2901L31.5091 18.3601ZM25.9719 21.5479L29.8146 23.7697V28.2025L25.9719 30.4242L22.1292 28.2025V23.7697L25.9719 21.5479ZM32.0126 25.0405L35.3648 26.9727V35.6653C35.3648 39.7133 32.0796 42.9963 28.0381 42.9963V42.9833C26.3285 42.9833 24.66 42.3868 23.3481 41.2889C23.4022 41.263 23.521 41.196 23.5859 41.1571L31.3751 36.6724C31.7727 36.4477 32.0234 36.0241 32.0105 35.5616L32.0126 25.0405ZM29.8254 30.7311V34.5955L22.2869 38.9353C18.7749 40.9474 14.2989 39.7566 12.2717 36.2618H12.2846C11.4244 34.7921 11.1175 33.0458 11.4093 31.3665C11.4633 31.4054 11.5692 31.4595 11.6341 31.4984L19.4233 35.9981C19.8209 36.2229 20.3094 36.2229 20.7071 35.9981L29.8254 30.7311Z"
                                    fill="white"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1_167">
                                    <rect width="52" height="52" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div class="file_explorer__right__helpers__helper" @click="openInNewTab('https://www.geeksforgeeks.org/understanding-time-complexity-simple-examples/')">
                        <svg width="80" height="41" viewBox="0 0 80 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M79.8893 20.1715C79.8315 19.6364 79.7404 19.1053 79.6165 18.5817L47.4985 18.5535C47.6421 17.3086 47.9619 16.0902 48.4478 14.936C49.1109 13.3422 50.0844 11.8978 51.3109 10.6875C52.5187 9.51333 53.9461 8.59162 55.5107 7.9759C58.0255 6.88672 60.8149 6.61011 63.4929 7.18437C66.1709 7.75863 68.6051 9.15564 70.4586 11.1815L75.5304 6.1933C73.7325 4.24495 71.5496 2.69516 69.1216 1.64317C66.4394 0.509418 63.5517 -0.0501404 60.6423 9.59979e-05C57.8959 -0.0166481 55.1722 0.503946 52.6237 1.53288C50.1842 2.51291 47.9604 3.96561 46.0791 5.80856C44.2044 7.66835 42.7044 9.87437 41.6615 12.3054C40.805 14.2879 40.28 16.3992 40.1074 18.5535H39.8981C39.7253 16.399 39.1994 14.2876 38.3416 12.3054C37.2997 9.87386 35.7998 7.66767 33.9244 5.80856C32.0434 3.96507 29.8196 2.5123 27.3798 1.53288C22.0689 -0.550962 16.166 -0.513269 10.8818 1.63804C8.4542 2.69068 6.27143 4.24038 4.47297 6.18817L9.54584 11.1764C11.4507 9.22869 13.8831 7.88607 16.5406 7.31621C19.1982 6.74634 21.9638 6.97406 24.4937 7.97077C26.0583 8.58612 27.4854 9.50788 28.6925 10.6824C29.9197 11.8923 30.8935 13.3368 31.5566 14.9309C32.0428 16.085 32.3626 17.3029 32.506 18.5479L0.387977 18.5766C0.264073 19.1002 0.172967 19.6308 0.115168 20.1658C0.043755 20.7841 0.00874843 21.406 0.0105361 22.0285C-0.00363231 24.4516 0.385094 26.8603 1.16047 29.1548C1.92243 31.3812 3.14942 33.418 4.7593 35.1284C6.52074 37.0028 8.65862 38.4793 11.0311 39.46C13.6838 40.5227 16.5207 41.0441 19.3759 40.9938C22.1218 41.0106 24.8446 40.4896 27.3923 39.46C29.8327 38.4817 32.0567 37.0283 33.9369 35.1838C35.8131 33.3253 37.3133 31.1195 38.3544 28.6874C38.8879 27.4625 39.2917 26.1842 39.5594 24.8745H40.47C40.7379 26.184 41.141 27.4622 41.673 28.6874C42.715 31.119 44.2151 33.3247 46.0905 35.1838C47.9711 37.0278 50.1951 38.4811 52.6352 39.46C55.1836 40.4895 57.9072 41.0105 60.6538 40.9938C63.5084 41.0442 66.3443 40.5228 68.9963 39.46C71.3692 38.4801 73.5072 37.0035 75.2681 35.1284C76.8785 33.4181 78.1064 31.3813 78.8692 29.1548C79.6444 26.8602 80.0328 24.4516 80.0189 22.0285C80.0116 21.4073 79.9682 20.7876 79.8893 20.1715ZM31.5495 26.063C30.8839 27.6622 29.8999 29.1076 28.6581 30.3105C27.4374 31.4815 26.0022 32.4031 24.4319 33.0242C21.0854 34.2831 17.4022 34.3022 14.0427 33.0785C12.6876 32.5277 11.441 31.7389 10.3612 30.7486C9.59215 30.0357 8.95504 29.1912 8.47962 28.2545C7.93032 27.1879 7.5182 26.0554 7.25338 24.8842H31.9833C31.8599 25.2847 31.7157 25.6786 31.5515 26.0641L31.5495 26.063ZM71.5174 28.2545C71.0419 29.1911 70.405 30.0355 69.6361 30.7486C68.5564 31.7389 67.3095 32.5278 65.9543 33.0785C62.5949 34.3022 58.9116 34.2831 55.5651 33.0242C53.9948 32.4027 52.5593 31.4811 51.338 30.3105C50.0962 29.1077 49.1128 27.6623 48.4478 26.063C48.2827 25.6766 48.1379 25.2818 48.014 24.8801H60.4739H72.7447C72.4799 26.0529 72.0678 27.1871 71.5184 28.2555L71.5174 28.2545Z"
                                fill="#2F8D46"/>
                        </svg>

                    </div>
                    <div class="file_explorer__right__helpers__helper" @click="openInNewTab('https://www.youtube.com/watch?v=Mo4vesaut8g&pp=ygUidGltZSBhbmQgc3BhY2UgY29tcGxleGl0eSBwbGF5bGlzdA%3D%3D')">
                        <svg width="63" height="44" viewBox="0 0 63 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M61.4208 6.87067C60.7025 4.16626 58.5865 2.03642 55.8991 1.31362C51.0292 0 31.4999 0 31.4999 0C31.4999 0 11.9707 0 7.10057 1.31362C4.41319 2.03642 2.29666 4.16626 1.57891 6.87067C0.274078 11.7725 0.274078 22.0001 0.274078 22.0001C0.274078 22.0001 0.274078 32.2272 1.57891 37.1296C2.29666 39.8343 4.41319 41.9636 7.1003 42.6872C11.9705 44.0003 31.4996 44.0003 31.4996 44.0003C31.4996 44.0003 51.029 44.0003 55.8989 42.6872C58.5863 41.9638 60.7023 39.8343 61.4205 37.1299C62.7256 32.2275 62.7256 22.0004 62.7256 22.0004C62.7256 22.0004 62.7256 11.7728 61.4205 6.87093"
                                fill="#FF0000"/>
                            <path d="M25.1128 31.2859L41.4353 22.0007L25.1128 12.7144V31.2859Z" fill="white"/>
                        </svg>

                    </div>
                </div>
            </div>

        </div>
        <div class="back">Lets<br>Tag<br>Some<br>Data</div>
    </div>
</template>

<style lang="scss">
@import url("https://use.typekit.net/jjw0wzr.css");

@mixin responsive($breakpoint) {
    @media (max-width: $breakpoint) {
        @content
    };
}


$screen-breakpoint-mobile-small: 360px;
$screen-breakpoint-mobile: 640px;
$screen-breakpoint-tablet-portrait: 1020px;
$screen-breakpoint-tablet-landscape: 1280px;
$screen-breakpoint-small-laptop: 1366px;
$screen-breakpoint-laptop: 1440px;


$color-background: #F9EEE2;
$color-brown: #8B4101;
$color-pink: #FEBDFF;
$color-blue: #005FFF;
$color-yellow: #FFFF00;

$padding-normal: 20px;

$text-huge: 300px;
$text-huge-line-height: 220px;

body {
    padding: 0;
    margin: 0;
    font-family: "Aktiv-grotesk", sans-serif;
    font-weight: 700;
    box-sizing: border-box;
}

.app {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: $color-background;
    flex: 1;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    position: absolute;
    overflow: hidden;

}

.navbar {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: $padding-normal;
    color: $color-blue;
    box-sizing: border-box;

    &__item {
        &:hover {
            cursor: pointer;
            text-decoration: underline;
        }
    }
}

.main {
    color: $color-blue;
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    height: 100%;

    &__interactive {
        grid-column: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;


        &__start_button {
            box-sizing: border-box;
            height: 100px;
            width: 350px;
            background-color: $color-brown;
            border-radius: 60px;
            padding: $padding-normal;
            display: flex;
            justify-content: center;
            align-items: center;
            color: $color-pink;
            font-size: 60px;

            &__text {
                font-variation-settings: "wdth" 100, "wght" 600;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            &:hover {
                cursor: pointer;
            }
        }

        &__name {
            color: $color-brown;
            font-size: 60px;
            margin-top: $padding-normal;
            width: 350px;
            box-shadow: 0 1px 0 0 $color-brown;
            outline: none;
            background-color: transparent;
            border: none;
            font-variation-settings: "wdth" 100, "wght" 600;
            text-align: center;
            font-family: "stinger-variable", sans-serif;
        }

        &__file_select {
            margin: ($padding-normal) ($padding-normal* 5);
            width: 80%;
            display: flex;
            flex-direction: column;
            padding: $padding-normal $padding-normal* 2;
            border-radius: 60px;
            background-color: $color-brown;
            cursor: pointer;

            &__title {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;


                &__main {
                    font-size: 64px;
                    font-weight: 900;
                    color: $color-pink;
                }

                &__sub {
                    font-size: 24px;
                    font-weight: 500;
                    color: $color-yellow;
                    margin-top: 0 - $padding-normal / 2;
                }
            }

            &__files {
                &__file {
                    font-weight: 900;
                    font-size: 32px;
                    color: $color-pink;
                    margin-bottom: $padding-normal / 2;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-direction: row;

                    &:hover {
                        cursor: pointer;
                        color: $color-yellow;
                    }
                }
            }
        }


    }
}

.file_explorer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-self: center;
    width: 1200px;
    height: 100%;
    min-height: 800px;
    margin: 40px 100px 100px 100px;
    border-radius: 60px;
    background-color: $color-brown;
    z-index: 1;

    @include responsive($screen-breakpoint-laptop) {
        min-height: 640px;
        max-height: 800px;
    }


    &__left {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;

        &__complexity {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: $color-background;

            &__title {
                color: $color-background;
                font-size: 60px;
                font-weight: 900;
                padding: $padding-normal / 2;
                margin-left: $padding-normal;
            }

            &__input {
                font-size: 30px;
                font-weight: 900;
                margin-bottom: $padding-normal;
                padding: $padding-normal;
                align-self: center;
                white-space: pre-wrap;
                outline: none;
                border: none;
                background-color: transparent;
                box-shadow: 0 1px 0 0 $color-background;
                width: 80%;
                color: $color-background;


                &::placeholder {
                    color: $color-background;
                    opacity: 0.5;
                }
            }
        }

        &__done {
            width: 300px;
            height: 60px;
            box-shadow: 0 0 0 1px $color-background;
            border-radius: 60px;
            color: $color-background;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 30px;


            &:hover {
                cursor: pointer;
                color: $color-pink;
                box-shadow: 0 0 0 1px $color-pink;
            }

        }


    }

    &__right {
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        align-items: start;
        padding: $padding-normal;

        &__title {
            color: $color-background;
            font-size: 24px;
            font-weight: 900;
            padding: $padding-normal / 2;
            margin-left: $padding-normal;
        }

        &__content {
            font-size: 16px;
            font-weight: 900;
            margin-bottom: $padding-normal;
            height: 100%;
            min-height: 400px;
            max-height: 500px;
            max-width: 500px;
            min-width: 450px;
            border-radius: 60px;
            padding: $padding-normal;
            align-self: center;
            background-color: $color-background;
            overflow: auto;
            white-space: pre-wrap;

            @include responsive($screen-breakpoint-laptop) {
                max-height: 400px;
                min-height: 300px;
            }


        }

        &__helpers {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;
            width: 100%;

            &__helper {
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s ease-in-out;

                &:hover {
                    opacity: 1;
                }
            }
        }
    }

}

.tagged_modal {
    position: absolute;
    display: grid;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-self: center;
    width: 1200px;
    height: 100%;
    min-height: 800px;
    margin: 40px 100px 100px 100px;
    padding: $padding-normal;
    border-radius: 60px;
    background-color: $color-brown;
    z-index: 3;
    overflow: auto;
    justify-items: center;

    @include responsive($screen-breakpoint-laptop) {
        min-height: 640px;
        max-height: 700px;
    }

    &__close {
        position: absolute;
        top: 30px;
        right: 60px;
        margin: $padding-normal;
        font-size: 12px;
        font-weight: 900;
        color: $color-background;
        transition: color 0.2s ease-in-out;

        &:hover {
            cursor: pointer;
            color: $color-pink;
        }
    }

    &__title {
        color: $color-background;
        font-size: 40px;
        font-weight: 900;
        padding: $padding-normal / 2;

    }

    &__files {
        display: flex;
        flex-direction: column;
        justify-content: start;
        width: 100%;
        &__file {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            height: 24px;
            width: 100%;
            font-weight: 500;

            &:first-child {
                margin-bottom: $padding-normal / 2;
                font-weight: 900;
                font-size: 20px;
            }
        }
    }

    &__show_more {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: $padding-normal;
        width: 200px;
        height: 40px;
        box-shadow: 0 0 0 1px $color-background;
        color: $color-background;
        border-radius: 60px;

        &:hover {
            cursor: pointer;
            color: $color-pink;
            box-shadow: 0 0 0 1px $color-pink;
        }
    }
}

.back {
    position: absolute;
    color: $color-blue;
    padding: $padding-normal * 2 $padding-normal / 2;
    width: 100%;
    font-size: $text-huge;
    line-height: $text-huge-line-height;
    pointer-events: none;

    @include responsive($screen-breakpoint-laptop) {
        font-size: 250px;
        line-height: 190px;
    }
}

.backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #000;
    z-index: 2;
    opacity: 0.5;
    pointer-events: none;
}
</style>
