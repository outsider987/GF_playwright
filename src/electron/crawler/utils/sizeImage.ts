export const conditionalGrapSize = (imageText: string) => {
    console.log(imageText.split(''));
    const had圍 = imageText.split('').includes('尺') && imageText.split('').includes('圍');
    console.log('had圍', had圍);
    const had胸 = imageText.split('').includes('尺') && imageText.split('').includes('胸');
    console.log('had胸', had胸);
    const had腰 = imageText.split('').includes('尺') && imageText.split('').includes('腰');
    console.log('had腰', had腰);

    const had寸圍 = imageText.split('').includes('寸') && imageText.split('').includes('圍');
    const had寸胸 = imageText.split('').includes('寸') && imageText.split('').includes('胸');
    const had寸腰 = imageText.split('').includes('寸') && imageText.split('').includes('腰');

    return had圍 || had胸 || had腰 || had寸圍 || had寸胸 || had寸腰;
};

export const finalCheckSenstitiveCgaracter = (input: string[]) => {
    const sensitiveChar = ['尺', '圍', '胸', '腰', '寸'];
    return input.some((element) => sensitiveChar.includes(element));
};
