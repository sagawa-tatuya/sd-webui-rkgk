class Rkgk {
	static #wh = [
		[ 256, 384 ],
		[ 320, 384 ],
		[ 384, 320 ],
		[ 384, 256 ]
	]

	static #maxPhase = this.#wh.length
	static #phase = this.#maxPhase -1

	static #YYYY = 0
	static #MM = 0
	static #DD = 0

	// rkgk プロンプト追加
	static #updatePrompt() {
		const rkgkPrompt = 'AI rkgk'
		const signPrompt = '<lora:signature_sagawa_v03:1.0> signature'
		const prompt = gradioApp()
			.getElementById( 'txt2img_prompt' )
			.querySelector( 'textarea' )

		var curPrompt = prompt.value

		if ( curPrompt.indexOf( rkgkPrompt ) == -1 ) {
			// rkgk プロンプト未追加 or 追加したが削除された
			if ( curPrompt == '' ) {
				curPrompt = rkgkPrompt
			} else {
				curPrompt = rkgkPrompt + ', ' + curPrompt
			}
		}

		if ( curPrompt.indexOf( signPrompt ) == -1 ) {
			// シグネチャプロンプト未追加 or 追加したが削除された
			curPrompt = curPrompt + ', ' + signPrompt
		}

		prompt.value = curPrompt
	  updateInput( prompt )
	}

	// Seed に YYYYMMDD を設定する
	static #updateSeed() {
		const seed = gradioApp()
			.getElementById( 'txt2img_seed' )
			.querySelector( 'input' )

		seed.value = `${this.#YYYY}${this.#MM}${this.#DD}`

		updateInput( seed )
	}

	// 画像サイズを設定する
	static #updateSize() {
		const width = gradioApp()
			.getElementById( 'txt2img_width' )
			.querySelector( 'input' )

		const height = gradioApp()
			.getElementById( 'txt2img_height' )
			.querySelector( 'input' )

		// rkgk ボタンを押すたびに ( width, height ) を切り替える
		width.value  = this.#wh[ ( this.#phase ) % this.#maxPhase ][ 0 ]
		height.value = this.#wh[ ( this.#phase ) % this.#maxPhase ][ 1 ]

		updateInput( width )
		updateInput( height )
	}

	// アップスケールを有効にする
	static #updateHiresFix() {
		const hiresFix = gradioApp()
			.getElementById( 'txt2img_enable_hr' )
			.querySelector( 'input' )

		if ( ! hiresFix.checked ) {
			hiresFix.checked = true
			hiresFix.dispatchEvent( new Event( 'change' ) )
		}
	}

	// rkgk ボタン押下イベントハンドラ
	static update() {
		const curDD = this.#DD
		const today = new Date()

		this.#YYYY = today.getFullYear()
		this.#MM = ( '0' + (today.getMonth() +1) ).slice( -2 )
		this.#DD = ( '0' +  today.getDate()      ).slice( -2 )

		this.#phase = ( curDD != this.#DD ) ? 0 : ( ( this.#phase + 1 ) % this.#maxPhase )

		this.#updatePrompt()
		this.#updateSeed()
		this.#updateSize()
		this.#updateHiresFix()
	}
}

class RkgkElementBuilder {
	static rkgkButton( { onClick } ) {
		const rkgkButton = gradioApp()
			.getElementById( 'txt2img_clear_prompt' )
			.cloneNode()

		rkgkButton.id = 'txt2img_rkgk_button'
		rkgkButton.title = 'today\'s rkgk'
		rkgkButton.textContent = '📆'

		rkgkButton.addEventListener( 'click', onClick )

		return rkgkButton
	}
}

onUiLoaded( () => {
	const rkgkButton = RkgkElementBuilder.rkgkButton({
		onClick: () => {
			Rkgk.update()
		}
	})

	gradioApp()
		.getElementById( 'txt2img_tools' )
		.appendChild( rkgkButton )
})
